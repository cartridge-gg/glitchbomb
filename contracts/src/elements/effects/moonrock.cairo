use super::index::Game;
use super::interface::EffectTrait;

pub impl Moonrock of EffectTrait {
    #[inline]
    fn apply(ref game: Game, count: u8) -> u16 {
        count.into()
    }
}
