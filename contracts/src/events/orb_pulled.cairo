pub use crate::events::index::OrbPulled;
use crate::models::game::Game;
use crate::types::orb::Orb;

#[generate_trait]
pub impl OrbPulledImpl of OrbPulledTrait {
    #[inline]
    fn new(id: u8, game: @Game, orb: @Orb) -> OrbPulled {
        OrbPulled { pack_id: *game.pack_id, game_id: *game.id, id: id, orb: (*orb).into() }
    }
}
