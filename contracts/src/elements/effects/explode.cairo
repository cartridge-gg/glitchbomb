use super::index::{Game, GameTrait};
use super::interface::EffectTrait;

pub impl Explode of EffectTrait {
    #[inline]
    fn apply(ref game: Game, count: u8) -> u16 {
        game.take_damage(count);
        0
    }
}
