use super::index::Game;
use super::interface::CurseTrait;

pub impl Demultiplier of CurseTrait {
    fn apply(ref game: Game, count: u8) {
        game.multiplier -= count.into();
    }
}
