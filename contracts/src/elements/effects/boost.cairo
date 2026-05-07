use super::index::{Game, GameTrait};
use super::interface::EffectTrait;

pub impl Boost of EffectTrait {
    #[inline]
    fn apply(ref game: Game, count: u8) {
        game.boost(count.into());
    }
}
