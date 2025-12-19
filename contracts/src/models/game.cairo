use core::dict::Felt252Dict;
use core::num::traits::Zero;
use crate::constants::{DEFAULT_LEVEL, MAX_CAPACITY, MAX_HEALTH};
use crate::helpers::bitmap::Bitmap;
use crate::helpers::deck::{Deck, DeckTrait};
use crate::helpers::power::TwoPower;
pub use crate::models::index::Game;
use crate::types::milestone::Milestone;
use crate::types::orb::{Orb, OrbTrait};
use crate::types::orbs::{Orbs, OrbsTrait};

pub const BASE_MULTIPLIER: u16 = 100;
pub const SUPP_MULTIPLIER: u16 = 20;

pub mod Errors {
    pub const GAME_INVALID_ID: felt252 = 'Game: invalid ID';
    pub const GAME_IS_OVER: felt252 = 'Game: is over';
    pub const GAME_NOT_OVER: felt252 = 'Game: not over';
    pub const GAME_IN_SHOP: felt252 = 'Game: in shop';
    pub const GAME_NOT_SHOP: felt252 = 'Game: not in shop';
    pub const GAME_STAGE_NOT_COMPLETED: felt252 = 'Game: stage not completed';
    pub const GAME_CANNOT_AFFORD: felt252 = 'Game: cannot afford';
    pub const GAME_BAG_FULL: felt252 = 'Game: bag full';
    pub const GAME_INVALID_INDICES: felt252 = 'Game: indicies must be sorted';
    pub const GAME_INVALID_INDEX: felt252 = 'Game: index out of range';
}

#[generate_trait]
pub impl GameImpl of GameTrait {
    fn new(pack_id: u64, game_id: u8) -> Game {
        // [Check] Inputs
        GameAssert::assert_valid_id(game_id);
        // [Effect] Create game
        Game {
            pack_id: pack_id,
            id: game_id,
            over: false,
            level: DEFAULT_LEVEL,
            health: MAX_HEALTH,
            immunity: 0,
            points: 0,
            milestone: Milestone::get(DEFAULT_LEVEL),
            multiplier: BASE_MULTIPLIER,
            chips: 0,
            bag: 0,
            discards: 0,
            shop: 0,
        }
    }

    #[inline]
    fn add(ref self: Game, orb: Orb) {
        // [Check] Bag is not full
        let mut bag: Orbs = OrbsTrait::unpack(self.bag);
        self.assert_not_full(bag.len());
        // [Effect] Add orb to the bag
        bag.append(orb);
        self.bag = bag.pack();
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
    fn earn_chips(ref self: Game, chips: u16) {
        self.chips += chips;
    }

    #[inline]
    fn spend(ref self: Game, cost: u16) {
        // [Check] Game can afford
        self.assert_can_afford(cost);
        // [Effect] Spend chips
        self.chips -= cost;
    }

    #[inline]
    fn heal(ref self: Game, health: u8) {
        self.health += core::cmp::min(health, MAX_HEALTH - self.health);
    }

    #[inline]
    fn restore(ref self: Game) {
        self.health = MAX_HEALTH;
    }

    #[inline]
    fn level_up(ref self: Game) {
        self.level += 1;
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
        let bag: Orbs = OrbsTrait::unpack(*self.bag);
        let exp: u8 = bag.len().try_into().unwrap();
        let full: u64 = TwoPower::pow(exp).try_into().unwrap() - 1;
        Bitmap::popcount(full ^ *self.discards)
    }

    #[inline]
    fn pulled_bombs_count(self: @Game) -> u8 {
        let bag: Orbs = OrbsTrait::unpack(*self.bag);
        let mut discards: u64 = *self.discards;
        let mut count: u8 = 0;
        let mut index = 0;
        while discards.is_non_zero() {
            // TODO: test if cheaper with a if statement
            count += bag.at(index).one_if_bomb() * (discards % 2).try_into().unwrap();
            index += 1;
            discards /= 2;
        }
        count
    }

    #[inline]
    fn is_over(self: @Game) -> bool {
        self.health == @0
    }

    #[inline]
    fn assess(ref self: Game) {
        self.over = self.is_over();
    }

    #[inline]
    fn start(ref self: Game) -> u16 {
        // [Effect] Set the initial bag
        self.bag = OrbsTrait::initial();
        // [Return] Entry fee
        Milestone::cost(self.level)
    }

    #[inline]
    fn cash_out(ref self: Game) -> u16 {
        // [Check] Game state
        self.assert_not_over();
        self.assert_not_shop();
        // [Effect] Convert points
        let moonrocks = self.points;
        self.points = 0;
        // [Effect] Update state
        self.over = true;
        // [Return] Moonrocks
        moonrocks
    }

    #[inline]
    fn enter(ref self: Game, seed: felt252) {
        // [Check] Game state
        self.assert_not_over();
        self.assert_not_shop();
        self.assert_stage_completed();
        // [Effect] Generate and set the shop
        let orbs: Orbs = OrbsTrait::shop(seed);
        self.shop = orbs.pack().try_into().expect('Shop: packing failed');
        // [Effect] Convert points
        self.earn_chips(self.points);
        self.points = 0;
    }

    #[inline]
    fn buy(ref self: Game, ref indices: Span<u8>) -> u16 {
        // [Check] Game state
        self.assert_not_over();
        self.assert_in_shop();
        // [Effect] Buy items
        let orbs: Orbs = OrbsTrait::unpack(self.shop.into());
        let max_index: u32 = orbs.len();
        // [Info] There is a cost multiplier when a same orb is bought multiple times
        let mut multipliers: Felt252Dict<u16> = Default::default();
        while let Option::Some(index) = indices.pop_front() {
            // [Check] Index is within range
            let current: u32 = (*index).into();
            assert(current < max_index, Errors::GAME_INVALID_INDEX);
            // [Effect] Buy orb
            let orb = *orbs.at((*index).into());
            let orb_id: u8 = orb.into();
            let base_cost = orb.cost();
            let orb_multiplier = multipliers.get(orb_id.into());
            let multiplier = if orb_multiplier.is_zero() {
                BASE_MULTIPLIER
            } else {
                orb_multiplier + SUPP_MULTIPLIER
            };
            // [Compute] Cost rounded up to the nearest integer
            let cost = (base_cost * multiplier + BASE_MULTIPLIER - 1) / BASE_MULTIPLIER;
            self.spend(cost);
            multipliers.insert(orb_id.into(), multiplier);
            // [Effect] Add orb to the bag
            self.add(orb);
        }
        // [Effect] Exit and enter the next stage
        self.level_up();
        self.restore();
        self.shop = 0;
        // [Return] Entry fee
        Milestone::cost(self.level)
    }

    #[inline]
    fn pull(ref self: Game, seed: felt252) -> (Orb, u16) {
        // [Check] Game is not over
        self.assert_not_over();
        // [Effect] Pull orb from the remaining orbs in the bag
        let bag: Orbs = OrbsTrait::unpack(self.bag);
        let mut deck: Deck = DeckTrait::from_bitmap(seed, bag.len(), self.discards.into());
        let index: u8 = deck.draw() - 1;
        let orb: Orb = *bag.at(index.into());
        // TODO: perform another draw if a corresponding curse is enabled
        // [Effect] Add the orb to the discards
        self.discards = Bitmap::set(self.discards, index);
        // [Effect] Apply the orb
        let earnings = orb.apply(ref self);
        // [Effect] Assess the game
        self.assess();
        // [Return] The pulled orb
        (orb, earnings)
    }
}

#[generate_trait]
pub impl GameAssert of AssertTrait {
    #[inline]
    fn assert_valid_id(game_id: u8) {
        assert(game_id != 0, Errors::GAME_INVALID_ID);
    }

    #[inline]
    fn assert_not_over(self: @Game) {
        assert(!*self.over, Errors::GAME_IS_OVER);
    }

    #[inline]
    fn assert_is_over(self: @Game) {
        assert(*self.over || self.id == @0, Errors::GAME_NOT_OVER);
    }

    #[inline]
    fn assert_not_shop(self: @Game) {
        assert(self.shop == @0, Errors::GAME_IN_SHOP);
    }

    #[inline]
    fn assert_in_shop(self: @Game) {
        assert(self.shop != @0, Errors::GAME_NOT_SHOP);
    }

    #[inline]
    fn assert_stage_completed(self: @Game) {
        let milestone: u16 = Milestone::get(*self.level);
        assert(self.points >= @milestone, Errors::GAME_STAGE_NOT_COMPLETED);
    }

    #[inline]
    fn assert_can_afford(self: @Game, cost: u16) {
        assert(self.chips >= @cost, Errors::GAME_CANNOT_AFFORD);
    }

    #[inline]
    fn assert_not_full(self: @Game, len: u32) {
        assert(len < MAX_CAPACITY, Errors::GAME_BAG_FULL);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const PACK_ID: u64 = 1;
    const GAME_ID: u8 = 2;
    const SEED: felt252 = 'SEED';

    #[test]
    fn test_game_new() {
        let game = GameTrait::new(PACK_ID, GAME_ID);
        assert_eq!(game.pack_id, PACK_ID);
        assert_eq!(game.id, GAME_ID);
        assert_eq!(game.over, false);
        assert_eq!(game.level, DEFAULT_LEVEL);
        assert_eq!(game.health, MAX_HEALTH);
        assert_eq!(game.immunity, 0);
        assert_eq!(game.points, 0);
        assert_eq!(game.milestone, Milestone::get(DEFAULT_LEVEL));
        assert_eq!(game.multiplier, BASE_MULTIPLIER);
    }

    #[test]
    fn test_game_start() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        let cost = game.start();
        assert_eq!(cost, Milestone::cost(DEFAULT_LEVEL));
        assert_eq!(game.bag != 0, true);
    }

    #[test]
    fn test_game_add() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        let bag = game.bag;
        game.add(Orb::Point5);
        assert_eq!(game.bag != bag, true);
        assert_eq!(game.bag != 0, true);
    }

    #[test]
    fn test_game_take_damage() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        game.take_damage(1);
        assert_eq!(game.health, MAX_HEALTH - 1);
    }

    #[test]
    fn test_game_earn_points() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        game.earn_points(10);
        assert_eq!(game.points, 10);
    }

    #[test]
    fn test_game_earn_chips() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        game.earn_chips(10);
        assert_eq!(game.chips, 10);
    }

    #[test]
    fn test_game_spend() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        game.earn_chips(20);
        game.spend(10);
        assert_eq!(game.chips, 10);
    }

    #[test]
    fn test_game_heal() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        game.take_damage(MAX_HEALTH - 1);
        game.heal(MAX_HEALTH - 1);
        assert_eq!(game.health, MAX_HEALTH);
    }

    #[test]
    fn test_game_restore() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        game.take_damage(MAX_HEALTH - 1);
        game.restore();
        assert_eq!(game.health, MAX_HEALTH);
    }

    #[test]
    fn test_game_level_up() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        game.level_up();
        assert_eq!(game.level, DEFAULT_LEVEL + 1);
    }

    #[test]
    fn test_game_immune() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        game.immune(1);
        assert_eq!(game.immunity, 1);
    }

    #[test]
    fn test_game_boost() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        game.boost(50);
        assert_eq!(game.multiplier, BASE_MULTIPLIER + 50);
    }

    #[test]
    fn test_game_pullable_orbs_count() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        let count = game.pullable_orbs_count();
        game.add(Orb::Point5);
        assert_eq!(game.pullable_orbs_count(), count + 1);
    }

    #[test]
    fn test_game_pulled_bombs_count() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        assert_eq!(game.pulled_bombs_count(), 0);
    }

    #[test]
    fn test_game_is_over() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        game.take_damage(MAX_HEALTH);
        assert_eq!(game.is_over(), true);
    }

    #[test]
    fn test_game_assess() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        game.take_damage(MAX_HEALTH);
        game.assess();
        assert_eq!(game.over, true);
    }

    #[test]
    fn test_game_cash_out() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        game.earn_points(100);
        let cash = game.cash_out();
        assert_eq!(cash, 100);
        assert_eq!(game.over, true);
    }

    #[test]
    fn test_game_enter() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        game.earn_points(100);
        game.enter(1);
        assert_eq!(game.shop != 0, true);
    }

    #[test]
    fn test_game_buy() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        game.earn_points(100);
        game.enter(SEED);
        // [Info] Shop: [19, 13, 9, 19, 18, 12]
        let mut indices: Span<u8> = [0, 3, 5].span();
        game.buy(ref indices);
        assert_eq!(game.chips, 100 - (5 + 6 + 8));
        assert_eq!(game.shop, 0);
    }
}

