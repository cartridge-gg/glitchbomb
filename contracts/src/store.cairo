use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use crate::models::index::{Config, Game, Pack, Starterpack};

#[derive(Copy, Drop)]
pub struct Store {
    pub world: WorldStorage,
}

#[generate_trait]
pub impl StoreImpl of StoreTrait {
    fn new(world: WorldStorage) -> Store {
        Store { world }
    }

    // Config

    fn config(self: @Store) -> Config {
        self.world.read_model(0)
    }

    fn set_config(mut self: Store, config: @Config) {
        self.world.write_model(config)
    }

    // Starterpack

    fn starterpack(self: @Store, starterpack_id: u32) -> Starterpack {
        self.world.read_model(starterpack_id)
    }

    fn set_starterpack(mut self: Store, starterpack: @Starterpack) {
        self.world.write_model(starterpack)
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
