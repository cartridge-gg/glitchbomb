#[starknet::component]
pub mod PlayableComponent {
    // Imports

    use core::num::traits::Zero;
    use dojo::world::{WorldStorage, WorldStorageTrait};
    use ekubo::components::clear::IClearDispatcherTrait;
    use ekubo::interfaces::erc20::IERC20Dispatcher as EkuboIERC20Dispatcher;
    use ekubo::interfaces::router::{IRouterDispatcherTrait, RouteNode, TokenAmount};
    use ekubo::types::i129::i129;
    use ekubo::types::keys::PoolKey;
    use starknet::ContractAddress;
    use crate::constants::MAX_SCORE;
    use crate::helpers::random::RandomTrait;
    use crate::helpers::rewarder::RewarderImpl;
    use crate::interfaces::erc20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use crate::models::config::{ConfigAssert, ConfigTrait};
    use crate::models::game::{BASE_MULTIPLIER, GameAssert, GameTrait, SUPP_MULTIPLIER};
    use crate::models::starterpack::StarterpackAssert;
    use crate::store::StoreTrait;
    use crate::systems::collection::{
        ICollectionDispatcher, ICollectionDispatcherTrait, NAME as COLLECTION,
    };
    use crate::types::orb::OrbTrait;
    use crate::types::orbs::OrbsTrait;

    // Ekubo pool parameters (hardcoded for sepolia)
    const POOL_FEE: u128 = 170141183460469235273462165868118016; // 0.05%
    const POOL_TICK_SPACING: u128 = 354892;
    const MIN_SQRT_RATIO: u256 = 18446748437148339061;
    const MAX_SQRT_RATIO: u256 = 6277100250585753475930931601400621808602321654880405518632;

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
                let game_id = collection.mint(recipient, true);

                // [Effect] Create game with starterpack stake
                let mut game = GameTrait::new(id: game_id, stake: starterpack.multiplier);
                game.created_at = starknet::get_block_timestamp();

                // [Effect] Start the game immediately (fill bag)
                let cost = game.start();

                // [Event] Emit PLDataPoint at baseline (initial moonrocks)
                store.pl_data_point(0, @game, game.moonrocks, 0);

                // [Effect] Spend moonrocks for entry
                game.spend_moonrocks(cost);
                store.set_game(@game);

                // [Interaction] Update token metadata
                collection.update(game_id.into());

                // [Event] Emit GameStarted
                store.game_started(@game);

                quantity -= 1;
            }

            // [Interaction] Buy-and-burn via Ekubo (skip when ekubo is not configured)
            let config = store.config();
            if config.ekubo.is_non_zero() {
                let this = starknet::get_contract_address();
                let quote = IERC20Dispatcher { contract_address: config.quote };
                let game_token = config.token();
                let amount = quote.balance_of(this);

                // Transfer USDC to ekubo router
                let router = store.ekubo_router();
                let clearer = store.ekubo_clearer();
                quote.transfer(router.contract_address, amount);

                // Construct pool key (token0 must be the smaller address)
                let (token0, token1, is_token1) = if config.quote < game_token.contract_address {
                    (config.quote, game_token.contract_address, false)
                } else {
                    (game_token.contract_address, config.quote, true)
                };
                let pool_key = PoolKey {
                    token0,
                    token1,
                    fee: POOL_FEE,
                    tick_spacing: POOL_TICK_SPACING,
                    extension: 0x73ec792c33b52d5f96940c2860d512b3884f2127d25e023eb9d44a678e4b971
                        .try_into()
                        .unwrap(),
                };

                // sqrt_ratio_limit: selling token0 -> price drops -> MIN; selling token1 -> rises
                // -> MAX
                let sqrt_ratio_limit = if is_token1 {
                    MAX_SQRT_RATIO
                } else {
                    MIN_SQRT_RATIO
                };
                let node = RouteNode { pool_key, sqrt_ratio_limit, skip_ahead: 0 };
                let token_amount = TokenAmount {
                    token: config.quote,
                    amount: i129 {
                        mag: amount.try_into().expect('Amount exceeds u128'), sign: false,
                    },
                };

                // Swap USDC for game token
                router.swap(node, token_amount);

                // Clear tokens from router to this contract
                clearer
                    .clear_minimum(
                        EkuboIERC20Dispatcher { contract_address: game_token.contract_address }, 0,
                    );
                clearer.clear(EkuboIERC20Dispatcher { contract_address: config.quote });

                // Burn all game tokens acquired
                let acquired = game_token.balance_of(this);
                game_token.burn(acquired);
            }
        }
    }

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>, +Drop<TContractState>,
    > of InternalTrait<TContractState> {
        fn pull(ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Token ownership
            let collection = self.collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), game_id.into());

            // [Check] Game is not over
            let mut game = store.game(game_id);
            game.assert_not_over();
            game.assert_not_expired(starknet::get_block_timestamp());

            // [Effect] Pull orb(s) - may be 2 if DoubleDraw curse is active
            let config = store.config();
            let mut rng = RandomTrait::new_vrf(config.vrf());
            let (orbs, earnings) = game.pull(rng.next_seed());

            // Calculate potential moonrocks and PL id base
            let potential_moonrocks = game.moonrocks + game.points;
            let pl_base_id: u32 = 1 + (game.pull_count.into() - orbs.len()) * 2;

            // [Event] Emit OrbPulled and PLDataPoint for each orb (max 2 with DoubleDraw)
            store.orb_pulled(@game, orbs.get(0), 0);
            store.orb_pulled(@game, orbs.get(1), 1);

            if let Option::Some(orb) = orbs.get(0) {
                let orb_type: u8 = (*orb.unbox()).into();
                store.pl_data_point(pl_base_id, @game, potential_moonrocks, orb_type);
            }
            if let Option::Some(orb) = orbs.get(1) {
                let orb_type: u8 = (*orb.unbox()).into();
                store.pl_data_point(pl_base_id + 1, @game, potential_moonrocks, orb_type);
            }

            // [Effect] Update game earnings if exists
            if earnings > 0 {
                game.earn_moonrocks(earnings);
            }

            // [Event] Emit GameOver if dead and cash out moonrocks
            if game.over {
                store.game_over(@game, 0);

                // [Effect] Compute reward from existing moonrocks (no points conversion)
                let score: u16 = if game.moonrocks > MAX_SCORE {
                    MAX_SCORE
                } else {
                    game.moonrocks
                };
                let config = store.config();
                let token = config.token();
                let supply = token.total_supply();
                let target = config.target_supply;
                let reward: u64 = RewarderImpl::amount(score, supply, target);
                let reward: u64 = reward * game.stake.into();

                store.set_game(@game);

                if reward > 0 {
                    let caller = starknet::get_caller_address();
                    token.mint(caller, reward.into());
                }
                return;
            }

            store.set_game(@game);
        }

        fn cash_out(ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Token ownership
            let collection = self.collection(world);
            let caller = starknet::get_caller_address();
            collection.assert_is_owner(caller, game_id.into());

            // [Check] Game is not over
            let mut game = store.game(game_id);
            game.assert_not_over();
            game.assert_not_expired(starknet::get_block_timestamp());

            // [Effect] Use accumulated moonrocks as score (clamped to MAX_SCORE)
            let score: u16 = if game.moonrocks > MAX_SCORE {
                MAX_SCORE
            } else {
                game.moonrocks
            };

            // [Effect] Cash out (marks over, clears points)
            game.cash_out();
            store.set_game(@game);

            // [Event] Emit GameOver (cash out)
            store.game_over(@game, 1);

            // [Effect] Compute reward via curve, multiplied by stake
            let config = store.config();
            let token = config.token();
            let supply = token.total_supply();
            let target = config.target_supply;
            let reward: u64 = RewarderImpl::amount(score, supply, target);
            let reward: u64 = reward * game.stake.into();

            if reward == 0 {
                return;
            }

            // [Interaction] Mint Glitch tokens to caller
            token.mint(caller, reward.into());
        }

        fn enter(ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Token ownership
            let collection = self.collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), game_id.into());

            // [Check] Game is not over
            let mut game = store.game(game_id);
            game.assert_not_over();
            game.assert_not_expired(starknet::get_block_timestamp());

            // [Effect] Enter shop
            let config = store.config();
            let mut rng = RandomTrait::new_vrf(config.vrf());
            let _cost = game.enter(rng.next_seed());
            store.set_game(@game);

            // [Event] Emit PLDataPoint for ante cost
            let pl_id: u32 = 1 + (game.pull_count.into() * 2) + game.level.into();
            let potential = game.moonrocks + game.points;
            store.pl_data_point(pl_id, @game, potential, 0);

            // [Event] Emit ShopEntered
            store.shop_entered(@game);
        }

        fn buy(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            game_id: u64,
            ref indices: Span<u8>,
        ) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Token ownership
            let collection = self.collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), game_id.into());

            // [Check] Game is not over
            let mut game = store.game(game_id);
            game.assert_not_over();
            game.assert_not_expired(starknet::get_block_timestamp());

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

        fn exit(ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Token ownership
            let collection = self.collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), game_id.into());

            // [Check] Game is not over
            let mut game = store.game(game_id);
            game.assert_not_over();
            game.assert_not_expired(starknet::get_block_timestamp());

            // [Effect] Exit shop (applies level-based curse)
            game.exit();
            store.set_game(@game);

            // [Event] Emit ShopExited
            store.shop_exited(@game, 0);
        }

        fn refresh(ref self: ComponentState<TContractState>, world: WorldStorage, game_id: u64) {
            // [Check] Feature disabled
            assert(false, 'Refresh is disabled');

            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Token ownership
            let collection = self.collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), game_id.into());

            // [Check] Game is not over
            let mut game = store.game(game_id);
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
            game_id: u64,
            bag_index: u8,
        ) {
            // [Check] Feature disabled
            assert(false, 'Burn is disabled');

            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Token ownership
            let collection = self.collection(world);
            collection.assert_is_owner(starknet::get_caller_address(), game_id.into());

            // [Check] Game is not over
            let mut game = store.game(game_id);
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
