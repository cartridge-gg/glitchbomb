#[starknet::component]
pub mod PlayableComponent {
    // Imports

    use dojo::world::{WorldStorage, WorldStorageTrait};
    use starknet::ContractAddress;
    use crate::helpers::random::RandomTrait;
    use crate::interfaces::erc20::IERC20DispatcherTrait;
    use crate::models::config::{ConfigAssert, ConfigTrait};
    use crate::models::game::{GameAssert, GameTrait};
    use crate::models::pack::{PackAssert, PackTrait};
    use crate::models::starterpack::StarterpackAssert;
    use crate::store::StoreTrait;
    use crate::systems::collection::{
        ICollectionDispatcher, ICollectionDispatcherTrait, NAME as COLLECTION,
    };

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

            // [Interaction] Mint games
            let collection = self.collection(world);
            while quantity > 0 {
                // [Interaction] Mint a game
                let pack_id = collection.mint(recipient, true);

                // [Effect] Create game
                let pack = PackTrait::new(id: pack_id);
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

            // [Effect] Update pack earnings if exists
            pack.spend(cost);
            store.set_pack(@pack);

            // [Interaction] Update token metadata
            collection.update(pack_id.into());
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

            // [Effect] Pull orb(s) - may be 2 if DoubleDraw curse is active
            let mut game = store.game(pack_id, game_id);
            let config = store.config();
            let mut rng = RandomTrait::new_vrf(config.vrf());
            let (_orbs, earnings) = game.pull(rng.next_seed());
            store.set_game(@game);

            // [Event] Emit event
            // TODO: emit an event with the orbs

            // [Effect] Update pack earnings if exists
            if (earnings == 0) {
                return;
            }
            let mut pack = store.pack(pack_id);
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
            collection.assert_is_owner(starknet::get_caller_address(), pack_id.into());

            // [Check] Game is not over
            let mut game = store.game(pack_id, game_id);
            game.assert_not_over();

            // [Effect] Cash out
            let earnings = game.cash_out();
            store.set_game(@game);

            // [Effect] Update pack earnings if exists
            if (earnings == 0) {
                return;
            }
            let mut pack = store.pack(pack_id);
            pack.earn(earnings);
            store.set_pack(@pack);
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

            // [Effect] Buy items (stays in shop)
            game.buy(ref indices);
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

            // [Effect] Exit shop and get next level cost
            let cost = game.exit();
            store.set_game(@game);

            // [Effect] Spend moonrocks for next level
            let mut pack = store.pack(pack_id);
            pack.spend(cost);
            store.set_pack(@pack);
        }

        fn refresh(
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

            // [Effect] Refresh shop (costs 4 chips, can only do once)
            let config = store.config();
            let mut rng = RandomTrait::new_vrf(config.vrf());
            game.refresh(rng.next_seed());
            store.set_game(@game);
        }

        fn burn(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            pack_id: u64,
            game_id: u8,
            bag_index: u8,
        ) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Token ownership
            let collection = self.collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), pack_id.into());

            // [Check] Game is not over
            let mut game = store.game(pack_id, game_id);
            game.assert_not_over();

            // [Effect] Burn orb from bag (costs 4 chips, can only do once)
            game.burn(bag_index);
            store.set_game(@game);
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
