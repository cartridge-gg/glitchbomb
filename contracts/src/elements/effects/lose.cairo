use super::index::Game;
use super::interface::EffectTrait;

pub const LOSS_PERCENT: u8 = 20; // Percentage of points lost

/// Lose effect: reduces the player's points by a flat percentage (20%), rounded down
pub impl Lose of EffectTrait {
    fn apply(ref game: Game, count: u8) -> u16 {
        // Calculate loss as percentage of current points (rounded down)
        // count represents the percentage (e.g., 20 = 20%)
        let percent: u16 = count.into();
        let loss: u16 = (game.points * percent) / 100;

        // Reduce points
        game.points -= loss;
        0 // No earnings
    }
}
