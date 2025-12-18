use super::index::Game;

pub trait PowerTrait {
    fn apply(ref game: Game, index: u8);
}
