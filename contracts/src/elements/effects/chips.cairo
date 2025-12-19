use super::index::{Game, GameTrait};
use super::interface::EffectTrait;

pub impl Chips of EffectTrait {
    #[inline]
    fn apply(ref game: Game, count: u8) -> u16 {
        game.earn_chips(count.into());
        0
    }
}
