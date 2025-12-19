#[starknet::component]
pub mod PlayableComponent {
    // Imports

    use dojo::world::{IWorldDispatcherTrait, WorldStorage};
    use crate::helpers::random::RandomTrait;
    use crate::models::game::{GameAssert, GameTrait};
    use crate::models::pack::{PackAssert, PackTrait};
    use crate::store::StoreTrait;

    // Storage

    #[storage]
    pub struct Storage {}

    // Events

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {}

    #[generate_trait]
    pub impl InternalImpl<
        TContractState, +HasComponent<TContractState>, +Drop<TContractState>,
    > of InternalTrait<TContractState> {
        fn new(ref self: ComponentState<TContractState>, world: WorldStorage) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Effect] Create pack
            let pack_id: u64 = world.dispatcher.uuid().into();
            let pack = PackTrait::new(pack_id);
            store.set_pack(@pack);
        }

        fn start(ref self: ComponentState<TContractState>, world: WorldStorage, pack_id: u64) {
            // [Setup] Store
            let store = StoreTrait::new(world);

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
        }

        fn pull(
            ref self: ComponentState<TContractState>,
            world: WorldStorage,
            pack_id: u64,
            game_id: u8,
        ) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Game is not over
            let mut game = store.game(pack_id, game_id);
            game.assert_not_over();

            // [Effect] Pull orb
            let mut rng = RandomTrait::new();
            let (_orb, earnings) = game.pull(rng.felt());
            store.set_game(@game);

            // [Event] Emit event
            // TODO: emit an event with the orb

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

            // [Check] Game is not over
            let mut game = store.game(pack_id, game_id);
            game.assert_not_over();

            // [Effect] Enter shop
            let mut rng = RandomTrait::new();
            game.enter(rng.felt());
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

            // [Check] Game is not over
            let mut game = store.game(pack_id, game_id);
            game.assert_not_over();

            // [Effect] Buy items
            game.buy(ref indices);
            store.set_game(@game);
        }
    }
}
