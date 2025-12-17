use super::index::Game;

pub trait EffectTrait {
    fn apply(ref game: Game, count: u8);
}
