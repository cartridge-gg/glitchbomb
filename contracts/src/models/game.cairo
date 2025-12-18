use crate::constants::{BASE_MULTIPLIER, DEFAULT_LEVEL, MAX_HEALTH};
pub use crate::models::index::Game;
use crate::types::milestone::Milestone;
use crate::types::orb::{Orb, OrbTrait};

pub mod Errors {
    pub const GAME_CANNOT_AFFORD: felt252 = 'Game: cannot afford';
    pub const GAME_IS_OVER: felt252 = 'Game: is over';
}

#[generate_trait]
pub impl GameImpl of GameTrait {
    fn new(pack_id: u64, game_id: u8, moonrocks: u16) -> Game {
        Game {
            pack_id: pack_id,
            id: game_id,
            level: DEFAULT_LEVEL,
            health: MAX_HEALTH,
            immunity: 0,
            points: 0,
            milestone: Milestone::get(DEFAULT_LEVEL),
            multiplier: BASE_MULTIPLIER,
            cheddah: 0,
            moonrocks: moonrocks,
            drawn_orbs: 0,
            pullable_orbs: 0,
            pulled_orbs: 0,
        }
    }

    #[inline]
    fn take_damage(ref self: Game, damage: u8) {
        self.health -= core::cmp::min(damage, self.health);
    }

    #[inline]
    fn earn_points(ref self: Game, points: u16) {
        self.points += self.multiplier * points / BASE_MULTIPLIER;
    }

    #[inline]
    fn earn_cheddah(ref self: Game, cheddah: u16) {
        self.cheddah += cheddah;
    }

    #[inline]
    fn earn_moonrocks(ref self: Game, moonrocks: u16) {
        self.moonrocks += moonrocks;
    }

    #[inline]
    fn heal(ref self: Game, health: u8) {
        self.health += core::cmp::min(health, MAX_HEALTH - self.health);
    }

    #[inline]
    fn immune(ref self: Game, immunity: u8) {
        self.immunity += immunity;
    }

    #[inline]
    fn boost(ref self: Game, multiplier: u16) {
        self.multiplier += multiplier;
    }

    #[inline]
    fn pullable_orbs_count(self: @Game) -> u8 {
        // TODO: implement
        0
    }

    #[inline]
    fn pulled_bombs_count(self: @Game) -> u8 {
        // TODO: implement
        0
    }

    #[inline]
    fn is_over(self: @Game) -> bool {
        self.health == @0
    }

    #[inline]
    fn start(ref self: Game) { // TODO: implement
    }

    #[inline]
    fn apply(ref self: Game, orb: Orb) {
        orb.apply(ref self);
        // TODO: assess game over
    }

    #[inline]
    fn pull(ref self: Game) { // TODO: implement
    }

    #[inline]
    fn buy(ref self: Game, index: u8) { // TODO: implement
    }
}

#[generate_trait]
pub impl GameAssert of AssertTrait {
    #[inline]
    fn assert_can_afford(self: @Game, cost: u16) {
        assert(self.moonrocks >= @cost, Errors::GAME_CANNOT_AFFORD);
    }

    #[inline]
    fn assert_not_over(self: @Game) {
        assert(!self.is_over(), Errors::GAME_IS_OVER);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_game_new() {
        let game = GameTrait::new(1, 1, 100);
        assert_eq!(game.pack_id, 1);
        assert_eq!(game.id, 1);
        assert_eq!(game.moonrocks, 100);
    }
}
