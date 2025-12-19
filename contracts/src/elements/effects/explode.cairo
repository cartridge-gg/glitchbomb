use super::index::{Game, GameTrait};
use super::interface::EffectTrait;

pub impl Explode of EffectTrait {
    #[inline]
    fn apply(ref game: Game, count: u8) -> u16 {
        // [Check] Immunity blocks damage
        if game.immunity > 0 {
            game.immunity -= 1;
            return 0;
        }
        game.take_damage(count);
        0
    }
}
