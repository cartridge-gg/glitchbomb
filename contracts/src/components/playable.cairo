#[starknet::component]
pub mod PlayableComponent {
    // Imports

    use dojo::world::{IWorldDispatcherTrait, WorldStorage};
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

        fn open(ref self: ComponentState<TContractState>, world: WorldStorage, pack_id: u64) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Pack not opened
            let mut pack = store.pack(pack_id);
            pack.assert_not_open();

            // [Effect] Open pack
            let game_id = pack.open();
            store.set_pack(@pack);

            // [Effect] Create first game
            let game = GameTrait::new(pack_id, game_id, pack.moonrocks);
            store.set_game(@game);
        }

        fn start(ref self: ComponentState<TContractState>, world: WorldStorage, pack_id: u64) {
            // [Setup] Store
            let store = StoreTrait::new(world);

            // [Check] Pack is opened
            let mut pack = store.pack(pack_id);
            pack.assert_is_open();

            // [Effect] Create game
            let game_id: u8 = pack.next();
            let game = GameTrait::new(pack_id, game_id, pack.moonrocks);
            store.set_game(@game);
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
            game.pull();
        }
    }
}
