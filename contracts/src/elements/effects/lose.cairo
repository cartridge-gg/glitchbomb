use core::hash::HashStateTrait;
use core::poseidon::PoseidonTrait;
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

        // Use dice with seed derived from game state
        let loss: u16 = if max_loss > 0 {
            // Create seed from game state
            let mut state = PoseidonTrait::new();
            state = state.update(game.pack_id.into());
            state = state.update(game.id.into());
            state = state.update(game.discards.into());
            let seed: felt252 = state.finalize();

            // Roll dice for random loss (1 to max_loss)
            let mut dice: Dice = DiceTrait::new(max_loss.into(), seed);
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

