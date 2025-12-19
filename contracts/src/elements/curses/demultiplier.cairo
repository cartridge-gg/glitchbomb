use crate::models::game::{CURSE_DEMULTIPLIER, GameTrait};
use super::index::Game;
use super::interface::CurseTrait;

/// Demultiplier curse: Multiplier boosts are halved when this curse is active.
/// This curse is applied by setting the CURSE_DEMULTIPLIER bit in the game's curses field.
/// The actual effect is handled in GameTrait::boost().
pub impl Demultiplier of CurseTrait {
    #[allow(unused_variables)]
    fn apply(ref game: Game, count: u8) {
        GameTrait::add_curse(ref game, CURSE_DEMULTIPLIER);
    }
}
