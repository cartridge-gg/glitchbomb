use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use crate::models::index::{Game, Pack};

#[derive(Copy, Drop)]
pub struct Store {
    pub world: WorldStorage,
}

#[generate_trait]
pub impl StoreImpl of StoreTrait {
    fn new(world: WorldStorage) -> Store {
        Store { world }
    }

    // Pack

    fn pack(self: @Store, pack_id: u64) -> Pack {
        self.world.read_model(pack_id)
    }

    fn set_pack(mut self: Store, pack: @Pack) {
        self.world.write_model(pack)
    }

    // Game

    fn game(self: @Store, pack_id: u64, game_id: u8) -> Game {
        self.world.read_model((pack_id, game_id))
    }

    fn set_game(mut self: Store, game: @Game) {
        self.world.write_model(game)
    }
}
