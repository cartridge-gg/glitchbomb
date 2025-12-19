use crate::models::game::{CURSE_DOUBLE_DRAW, GameTrait};
use super::index::Game;
use super::interface::CurseTrait;

/// DoubleDraw curse: Player draws 2 orbs at a time instead of 1.
/// This curse is applied by setting the CURSE_DOUBLE_DRAW bit in the game's curses field.
/// The actual draw logic is handled in GameTrait::pull().
pub impl DoubleDraw of CurseTrait {
    #[allow(unused_variables)]
    fn apply(ref game: Game, count: u8) {
        GameTrait::add_curse(ref game, CURSE_DOUBLE_DRAW);
    }
}
