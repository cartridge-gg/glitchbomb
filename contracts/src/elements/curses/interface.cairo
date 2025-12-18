use super::index::Game;

pub trait CurseTrait {
    fn apply(ref game: Game, count: u8);
}
