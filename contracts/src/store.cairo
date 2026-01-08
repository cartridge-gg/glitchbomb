use dojo::event::EventStorage;
use dojo::model::ModelStorage;
use dojo::world::WorldStorage;
use crate::events::index::{
    GameOverTrait, GameStartedTrait, OrbBurnedTrait, OrbPulledTrait, OrbPurchasedTrait,
    ShopEnteredTrait, ShopExitedTrait, ShopRefreshedTrait,
};
use crate::models::index::{Config, Game, Pack, Starterpack};
use crate::types::orb::Orb;

#[derive(Copy, Drop)]
pub struct Store {
    pub world: WorldStorage,
}

#[generate_trait]
pub impl StoreImpl of StoreTrait {
    #[inline]
    fn new(world: WorldStorage) -> Store {
        Store { world }
    }

    // Config

    #[inline]
    fn config(self: @Store) -> Config {
        self.world.read_model(0)
    }

    #[inline]
    fn set_config(mut self: Store, config: @Config) {
        self.world.write_model(config)
    }

    // Starterpack

    #[inline]
    fn starterpack(self: @Store, starterpack_id: u32) -> Starterpack {
        self.world.read_model(starterpack_id)
    }

    #[inline]
    fn set_starterpack(mut self: Store, starterpack: @Starterpack) {
        self.world.write_model(starterpack)
    }

    // Pack

    #[inline]
    fn pack(self: @Store, pack_id: u64) -> Pack {
        self.world.read_model(pack_id)
    }

    #[inline]
    fn set_pack(mut self: Store, pack: @Pack) {
        self.world.write_model(pack)
    }

    // Game

    #[inline]
    fn game(self: @Store, pack_id: u64, game_id: u8) -> Game {
        self.world.read_model((pack_id, game_id))
    }

    #[inline]
    fn set_game(mut self: Store, game: @Game) {
        self.world.write_model(game)
    }

    // Events

    #[inline]
    fn game_started(mut self: Store, game: @Game) {
        self.world.emit_event(@GameStartedTrait::new(game));
    }

    #[inline]
    fn orb_pulled(mut self: Store, game: @Game, orb: Option<Box<@Orb>>, index: u8) {
        if let Some(orb) = orb {
            self
                .world
                .emit_event(@OrbPulledTrait::new(*game.pull_count - index, game, orb.unbox()));
        }
    }

    #[inline]
    fn shop_entered(mut self: Store, game: @Game) {
        self.world.emit_event(@ShopEnteredTrait::new(game));
    }

    #[inline]
    fn orb_purchased(mut self: Store, game: @Game, orb_id: u8, cost: u16) {
        self.world.emit_event(@OrbPurchasedTrait::new(game, orb_id, cost));
    }

    #[inline]
    fn shop_refreshed(mut self: Store, game: @Game) {
        self.world.emit_event(@ShopRefreshedTrait::new(game));
    }

    #[inline]
    fn orb_burned(mut self: Store, game: @Game, orb_id: u8, bag_index: u8) {
        self.world.emit_event(@OrbBurnedTrait::new(game, orb_id, bag_index));
    }

    #[inline]
    fn shop_exited(mut self: Store, game: @Game, cost: u16) {
        self.world.emit_event(@ShopExitedTrait::new(game, cost));
    }

    #[inline]
    fn game_over(mut self: Store, game: @Game, reason: u8) {
        self.world.emit_event(@GameOverTrait::new(game, reason));
    }
}
