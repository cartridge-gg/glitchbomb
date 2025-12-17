use super::index::{Game, GameTrait};
use super::interface::EffectTrait;

pub impl Explode of EffectTrait {
    #[inline]
    fn apply(ref game: Game, count: u8) {
        game.take_damage(count);
    }
}
