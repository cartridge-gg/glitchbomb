use crate::helpers::dice::{Dice, DiceTrait};
use super::index::Game;
use super::interface::EffectTrait;

pub const MAX_LOSS_PERCENT: u8 = 20; // Maximum percentage of points that can be lost

/// Lose effect: reduces the player's points by a percentage (up to MAX_LOSS_PERCENT%)
/// The actual loss is random between 1% and MAX_LOSS_PERCENT% of current points
pub impl Lose of EffectTrait {
    fn apply(ref game: Game, count: u8) -> u16 {
        // Calculate max loss as percentage of current points
        // count represents max percentage (e.g., 20 = 20%)
        let max_percent: u16 = count.into();
        let max_loss: u16 = (game.points * max_percent) / 100;

        // Use dice with VRF seed from game
        let loss: u16 = if max_loss > 0 {
            // Roll dice for random loss (1 to max_loss) using VRF seed
            let mut dice: Dice = DiceTrait::new(max_loss.into(), game.seed);
            dice.roll().into()
        } else {
            0
        };

        // Reduce points (can't go below 0)
        if game.points >= loss {
            game.points -= loss;
        } else {
            game.points = 0;
        }
        0 // No earnings
    }
}

