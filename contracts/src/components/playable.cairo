#[starknet::component]
pub mod PlayableComponent {
    // Imports

    use dojo::world::{WorldStorage, WorldStorageTrait};
    use starknet::ContractAddress;
    use crate::constants::BASE_COST_DOLLARS;
    use crate::helpers::random::RandomTrait;
    use crate::interfaces::erc20::IERC20DispatcherTrait;
    use crate::models::config::{ConfigAssert, ConfigTrait};
    use crate::models::game::{BASE_MULTIPLIER, GameAssert, GameTrait, SUPP_MULTIPLIER};
    use crate::models::pack::{PackAssert, PackTrait};
    use crate::models::starterpack::StarterpackAssert;
    use crate::store::StoreTrait;
    use crate::systems::collection::{
        ICollectionDispatcher, ICollectionDispatcherTrait, NAME as COLLECTION,
    };
    use crate::types::orb::OrbTrait;
    use crate::types::orbs::OrbsTrait;

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl StarterpackImpl<
        TContractState, +HasComponent<TContractState>,
    > of IStarterpackImplementation<TContractState> {
        fn on_issue(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            recipient: ContractAddress,
            starterpack_id: u32,
            mut quantity: u32,
        ) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Caller is allowed
            let config = store.config();
            let caller = starknet::get_caller_address();
            config.assert_is_registry(caller);

            // [Check] Starterpack exists
            let starterpack = store.starterpack(starterpack_id);
            starterpack.assert_does_exist();

            // [Setup] Derive entry cost in whole dollars from starterpack price
            let entry_cost: u16 = (starterpack.price / 1_000_000).try_into().unwrap();

            // [Interaction] Mint games
            let collection = self.collection(world);
            while quantity > 0 {
                // [Interaction] Mint a game
                let pack_id = collection.mint(recipient, true);

                // [Effect] Create game with entry cost
                let pack = PackTrait::new(id: pack_id, entry_cost: entry_cost);
                store.set_pack(@pack);
                quantity -= 1;
            }

            // [Interaction] Transfer the entry price to the fee receiver
            // TODO: transfer part to the prize pool once available
            let config = store.config();
            let token = config.token();
            let receiver = config.fee_receiver;
            let amount = token.balance_of(starknet::get_contract_address());
            token.transfer(receiver, amount);
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>, +Drop<TContractState>,
    > of InternalTrait<TContractState> {
        fn start(ref self: ComponentState<TContractState>, world: WorldStorage, pack_id: u64) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Token ownership
            let collection = self.collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), pack_id.into());

            // [Check] Pack is not over
            let mut pack = store.pack(pack_id);
            pack.assert_not_over();

            // [Check] Previous game is over if exists
            let game = store.game(pack_id, pack.game_count);
            game.assert_is_over();

            // [Effect] Create and start a new game
            let game_id: u8 = pack.open();
            let mut game = GameTrait::new(pack_id, game_id);
            let cost = game.start();
            store.set_game(@game);

            // [Event] Emit PLDataPoint before level cost (initial moonrocks)
            store.pl_data_point(0, pack_id, game_id, pack.moonrocks, 0);

            // [Effect] Update pack earnings if exists
            pack.spend(cost);
            store.set_pack(@pack);

            // [Event] Emit PLDataPoint after level cost
            let potential = pack.moonrocks + GameTrait::cash_out_payout(game.points);
            store.pl_data_point(1, pack_id, game_id, potential, 0);

            // [Interaction] Update token metadata
            collection.update(pack_id.into());

            // [Event] Emit GameStarted
            store.game_started(@game);
        }

        fn pull(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            pack_id: u64,
            game_id: u8,
        ) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Token ownership
            let collection = self.collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), pack_id.into());

            // [Check] Game is not over
            let mut game = store.game(pack_id, game_id);
            game.assert_not_over();

            // [Effect] Get pack for moonrocks tracking
            let mut pack = store.pack(pack_id);

            // [Effect] Pull orb(s) - may be 2 if DoubleDraw curse is active
            let config = store.config();
            let mut rng = RandomTrait::new_vrf(config.vrf());
            let (orbs, earnings) = game.pull(rng.next_seed());
            store.set_game(@game);

            // Calculate potential moonrocks and PL id base
            let potential_moonrocks = pack.moonrocks + GameTrait::cash_out_payout(game.points);
            let pl_base_id: u32 = 2 + (game.pull_count.into() - orbs.len()) * 2;

            // [Event] Emit OrbPulled and PLDataPoint for each orb (max 2 with DoubleDraw)
            store.orb_pulled(@game, orbs.get(0), 0, pack.moonrocks);
            store.orb_pulled(@game, orbs.get(1), 1, pack.moonrocks);

            if let Option::Some(orb) = orbs.get(0) {
                let orb_type: u8 = (*orb.unbox()).into();
                store.pl_data_point(pl_base_id, pack_id, game_id, potential_moonrocks, orb_type);
            }
            if let Option::Some(orb) = orbs.get(1) {
                let orb_type: u8 = (*orb.unbox()).into();
                store
                    .pl_data_point(pl_base_id + 1, pack_id, game_id, potential_moonrocks, orb_type);
            }

            // [Event] Emit GameOver if dead
            if game.over {
                store.game_over(@game, 0);
            }

            // [Effect] Update pack earnings if exists
            if (earnings == 0) {
                return;
            }
            pack.earn(earnings);
            store.set_pack(@pack);
        }

        fn cash_out(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            pack_id: u64,
            game_id: u8,
        ) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Token ownership
            let collection = self.collection(world);
            let caller = starknet::get_caller_address();
            collection.assert_is_owner(caller, pack_id.into());

            // [Check] Game is not over
            let mut game = store.game(pack_id, game_id);
            game.assert_not_over();

            // [Effect] Cash out
            let earnings = game.cash_out();
            store.set_game(@game);

            // [Event] Emit GameOver (cash out)
            store.game_over(@game, 1);

            // [Effect] Update pack earnings if exists
            if (earnings == 0) {
                return;
            }
            let mut pack = store.pack(pack_id);
            pack.earn(earnings);
            store.set_pack(@pack);

            // [Interaction] Mint moonrocks token to caller, scaled by entry cost multiplier
            let token = store.config().token();
            let scaled: u256 = (earnings.into() * pack.entry_cost.into())
                / BASE_COST_DOLLARS.into();
            token.mint(caller, scaled);
        }

        fn enter(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            pack_id: u64,
            game_id: u8,
        ) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Token ownership
            let collection = self.collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), pack_id.into());

            // [Check] Game is not over
            let mut game = store.game(pack_id, game_id);
            game.assert_not_over();

            // [Effect] Enter shop
            let config = store.config();
            let mut rng = RandomTrait::new_vrf(config.vrf());
            game.enter(rng.next_seed());
            store.set_game(@game);

            // [Event] Emit ShopEntered
            store.shop_entered(@game);
        }

        fn buy(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            pack_id: u64,
            game_id: u8,
            ref indices: Span<u8>,
        ) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Token ownership
            let collection = self.collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), pack_id.into());

            // [Check] Game is not over
            let mut game = store.game(pack_id, game_id);
            game.assert_not_over();

            // [Info] Get shop orbs for event emission
            let orbs = GameTrait::get_shop_orbs(game.shop);

            // [Effect] Buy each item and emit event
            while let Option::Some(index) = indices.pop_front() {
                let orb = *orbs.at((*index).into());
                let orb_id: u8 = orb.into();
                let purchase_count = GameTrait::get_purchase_count(game.shop, orb_id);
                let multiplier = BASE_MULTIPLIER + (purchase_count.into() * SUPP_MULTIPLIER);
                let cost = (orb.cost() * multiplier + BASE_MULTIPLIER - 1) / BASE_MULTIPLIER;

                // [Effect] Buy single orb
                let mut single: Span<u8> = [*index].span();
                game.buy(ref single);

                // [Event] Emit OrbPurchased
                store.orb_purchased(@game, orb_id, cost);
            }

            store.set_game(@game);
        }

        fn exit(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            pack_id: u64,
            game_id: u8,
        ) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Token ownership
            let collection = self.collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), pack_id.into());

            // [Check] Game is not over
            let mut game = store.game(pack_id, game_id);
            game.assert_not_over();

            // [Effect] Exit shop and get next level cost (applies level-based curse)
            let cost = game.exit();
            store.set_game(@game);

            // [Event] Emit ShopExited (includes next level info)
            store.shop_exited(@game, cost);

            // [Effect] Spend moonrocks for next level
            let mut pack = store.pack(pack_id);
            pack.spend(cost);
            store.set_pack(@pack);

            // [Event] Emit PLDataPoint for level cost
            // Use a high base id to avoid collision with pull events
            // pl_id = 2 + pull_count * 2 + level_offset
            let pl_id: u32 = 2 + (game.pull_count.into() * 2) + (game.level.into() - 1);
            let potential = pack.moonrocks + GameTrait::cash_out_payout(game.points);
            store.pl_data_point(pl_id, pack_id, game_id, potential, 0);
        }

        fn refresh(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            pack_id: u64,
            game_id: u8,
        ) {
            // [Check] Feature disabled
            assert(false, 'Refresh is disabled');

            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Token ownership
            let collection = self.collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), pack_id.into());

            // [Check] Game is not over
            let mut game = store.game(pack_id, game_id);
            game.assert_not_over();

            // [Effect] Refresh shop (costs 4 chips, can only do once)
            let config = store.config();
            let mut rng = RandomTrait::new_vrf(config.vrf());
            game.refresh(rng.next_seed());
            store.set_game(@game);

            // [Event] Emit ShopRefreshed
            store.shop_refreshed(@game);
        }

        fn burn(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            pack_id: u64,
            game_id: u8,
            bag_index: u8,
        ) {
            // [Check] Feature disabled
            assert(false, 'Burn is disabled');

            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Token ownership
            let collection = self.collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), pack_id.into());

            // [Check] Game is not over
            let mut game = store.game(pack_id, game_id);
            game.assert_not_over();

            // [Info] Get orb being burned for event
            let bag = OrbsTrait::unpack(game.bag);
            let orb = *bag.at(bag_index.into());
            let orb_id: u8 = orb.into();

            // [Effect] Burn orb from bag (costs 4 chips, can only do once)
            game.burn(bag_index);
            store.set_game(@game);

            // [Event] Emit OrbBurned
            store.orb_burned(@game, orb_id, bag_index);
        }
    }

    #[generate_trait]
    pub impl PrivateImpl<
        TContractState, +HasComponent<TContractState>,
    > of PrivateTrait<TContractState> {
        fn collection(
            ref self: ComponentState<TContractState>, world: WorldStorage,
        ) -> ICollectionDispatcher {
            let (collection_address, _) = world.dns(@COLLECTION()).expect('Collection not found!');
            ICollectionDispatcher { contract_address: collection_address }
        }
    }
}
