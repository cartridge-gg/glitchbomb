use super::index::{Game, GameTrait};
use super::interface::EffectTrait;

pub impl Earn of EffectTrait {
    #[inline]
    fn apply(ref game: Game, count: u8) {
        game.earn_points(count.into());
    }
}
