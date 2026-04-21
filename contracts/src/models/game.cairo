use core::num::traits::Zero;
use crate::constants::{
    DEFAULT_LEVEL, DEFAULT_MOONROCKS, GAME_EXPIRATION_TIME, MAX_CAPACITY, MAX_HEALTH,
};
use crate::helpers::bitmap::Bitmap;
use crate::helpers::deck::{Deck, DeckTrait};
use crate::helpers::power::TwoPower;
use crate::helpers::rewarder::Rewarder;
pub use crate::models::index::Game;
use crate::types::counters::{Counters, CountersTrait};
use crate::types::curse::{Curse, CurseTrait};
use crate::types::milestone::Milestone;
use crate::types::orb::{Orb, OrbTrait};
use crate::types::orbs::{Orbs, OrbsTrait};

pub const BASE_MULTIPLIER: u16 = 100;
pub const SUPP_MULTIPLIER: u16 = 20;
pub const SHOP_ACTION_COST: u16 = 4;

// Curse bit positions (u8 bitmap)
pub const CURSE_DOUBLE_DRAW: u8 = 0; // Bit 0: Draw 2 orbs at a time
pub const CURSE_DEMULTIPLIER: u8 = 1; // Bit 1: Multiplier boosts are halved
// Shop field bit layout (u128):
// Bits 0-29: 6 orbs * 5 bits = orb types (cleared on shop exit)
// Bit 30: refresh_used flag (cleared on shop exit)
// Bit 31: burn_used flag (cleared on shop exit)
// Bits 32-91: 20 orb types * 3 bits = purchase counts (persist across entire game run)
const ORBS_BITS: u8 = 30;
const REFRESH_BIT: u8 = 30;
const BURN_BIT: u8 = 31;
const PURCHASE_OFFSET: u8 = 32;
const BITS_PER_PURCHASE: u8 = 3;

pub mod Errors {
    pub const GAME_IS_OVER: felt252 = 'Game: is over';
    pub const GAME_NOT_OVER: felt252 = 'Game: not over';
    pub const GAME_NOT_STARTED: felt252 = 'Game: not started';
    pub const GAME_ALREADY_STARTED: felt252 = 'Game: already started';
    pub const GAME_IN_SHOP: felt252 = 'Game: in shop';
    pub const GAME_NOT_SHOP: felt252 = 'Game: not in shop';
    pub const GAME_NOT_COMPLETED: felt252 = 'Game: stage is not completed';
    pub const GAME_IS_COMPLETED: felt252 = 'Game: stage is completed';
    pub const GAME_CANNOT_AFFORD: felt252 = 'Game: cannot afford';
    pub const GAME_CANNOT_AFFORD_MR: felt252 = 'Game: not enough moonrocks';
    pub const GAME_BAG_FULL: felt252 = 'Game: bag full';
    pub const GAME_INVALID_INDICES: felt252 = 'Game: indicies must be sorted';
    pub const GAME_INVALID_INDEX: felt252 = 'Game: index out of range';
    pub const GAME_SHOP_REFRESH_USED: felt252 = 'Game: shop refresh used';
    pub const GAME_SHOP_BURN_USED: felt252 = 'Game: shop burn used';
    pub const GAME_CANNOT_BURN_BOMB: felt252 = 'Game: cannot burn bomb';
    pub const GAME_INVALID_BAG_INDEX: felt252 = 'Game: invalid bag index';
    pub const GAME_HAS_EXPIRED: felt252 = 'Game: has expired';
    pub const GAME_ALREADY_CLAIMED: felt252 = 'Game: already claimed';
}

#[generate_trait]
pub impl GameImpl of GameTrait {
    fn new(id: u64, stake: u128) -> Game {
        Game {
            id: id,
            claimed: false,
            level: DEFAULT_LEVEL,
            health: MAX_HEALTH,
            immunity: 0,
            curses: 0,
            pull_count: 0,
            points: 0,
            milestone: Milestone::get(DEFAULT_LEVEL),
            multiplier: BASE_MULTIPLIER,
            chips: 0,
            over: 0,
            expiration: 0,
            discards: 0,
            bag: 0,
            shop: 0,
            moonrocks: DEFAULT_MOONROCKS,
            stake: stake,
            level_counters: 0,
            counters: 0,
            supply: 0,
            price: 0,
        }
    }

    #[inline]
    fn earn_moonrocks(ref self: Game, earnings: u16) {
        self.moonrocks += earnings;
    }

    #[inline]
    fn spend_moonrocks(ref self: Game, cost: u16) {
        self.assert_can_afford_moonrocks(cost);
        self.moonrocks -= cost;
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
    fn is_full_health(self: @Game) -> bool {
        self.health == @MAX_HEALTH
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
        self.milestone = Milestone::get(self.level);
    }

    #[inline]
    fn counters(self: @Game) -> Counters {
        CountersTrait::unpack(*self.counters)
    }

    #[inline]
    fn level_counters(self: @Game) -> Counters {
        CountersTrait::unpack(*self.level_counters)
    }

    #[inline]
    fn immune(ref self: Game, immunity: u8) {
        self.immunity += immunity;
    }

    #[inline]
    fn counts(self: @Game) -> (u8, u8, u8, u8, u8, u8) {
        let bag: Orbs = OrbsTrait::unpack(*self.bag);
        bag.counts()
    }

    #[inline]
    fn boost(ref self: Game, multiplier: u16) {
        // If Demultiplier curse is active, halve the boost
        let actual_boost = if Self::has_curse(self.curses, CURSE_DEMULTIPLIER) {
            multiplier / 2
        } else {
            multiplier
        };
        self.multiplier += actual_boost;
    }

    #[inline]
    fn pullable_orbs_count(self: @Game) -> u8 {
        let bag: Orbs = OrbsTrait::unpack(*self.bag);
        let exp: u8 = bag.len().try_into().unwrap();
        let full: u64 = TwoPower::pow(exp).try_into().unwrap() - 1;
        Bitmap::popcount(full ^ *self.discards)
    }

    #[inline]
    fn sticky_orbs_count(self: @Game) -> u8 {
        let bag: Orbs = OrbsTrait::unpack(*self.bag);
        let bag_len: u8 = bag.len().try_into().unwrap();
        let mut count: u8 = 0;
        let mut index: u8 = 0;
        while index < bag_len {
            if *bag.at(index.into()) == Orb::StickyBomb {
                count += 1;
            }
            index += 1;
        }
        count
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

    /// Determines if the game is over based on the current health.
    #[inline]
    fn is_over(self: @Game) -> bool {
        self.health == @0
    }

    /// Determines if the game has expired based on the current timestamp.
    #[inline]
    fn is_expired(self: @Game) -> bool {
        starknet::get_block_timestamp() >= *self.expiration
    }

    /// Determines if the game is completed based on the current points.
    #[inline]
    fn is_completed(self: @Game) -> bool {
        self.points >= @Milestone::get(*self.level)
    }

    /// Assesses the game state and updates the game over status.
    #[inline]
    fn assess(ref self: Game) {
        if self.is_over() {
            self.over = starknet::get_block_timestamp();
        }
    }

    #[inline]
    fn start(ref self: Game) -> u16 {
        // [Effect] Set the initial bag
        self.bag = OrbsTrait::initial();
        // [Effect] Set expiration
        self.expiration = starknet::get_block_timestamp() + GAME_EXPIRATION_TIME;
        // [Effect] Update game counters
        let mut game_counters: Counters = self.counters();
        game_counters.streak_save += 1;
        self.counters = game_counters.pack();
        // [Return] Entry fee
        Milestone::cost(self.level)
    }

    #[inline]
    fn cash_out(ref self: Game) -> u16 {
        // [Effect] Convert points
        let moonrocks = self.points;
        self.points = 0;
        // [Effect] Update state
        self.over = starknet::get_block_timestamp();
        // [Return] Moonrocks
        moonrocks
    }

    #[inline]
    fn enter(ref self: Game, seed: felt252) -> u16 {
        // [Check] Game state
        self.assert_not_over();
        self.assert_not_shop();
        self.assert_is_completed();
        // [Effect] Reset discards so all orbs are available on entering the shop
        self.discards = 0;
        // [Effect] Reset level counters
        self.level_counters = 0;
        // [Effect] Generate and set the shop (orbs in bits 0-29, preserve purchase counts)
        let orbs: Orbs = OrbsTrait::shop(seed);
        let packed_orbs: u128 = orbs.pack().try_into().expect('Shop: packing failed');
        // Preserve purchase counts from bits 32+ across shop visits
        let purchase_shift: u128 = TwoPower::pow(PURCHASE_OFFSET).try_into().unwrap();
        let purchase_counts = (self.shop / purchase_shift) * purchase_shift;
        self.shop = packed_orbs + purchase_counts;
        // [Effect] Convert points to chips
        self.earn_chips(self.points);
        self.points = 0;
        // [Effect] Spend moonrocks for the next level ante
        let cost = Milestone::cost(self.level + 1);
        self.spend_moonrocks(cost);
        cost
    }

    #[inline]
    fn buy(ref self: Game, ref indices: Span<u8>) {
        // [Check] Game state
        self.assert_not_over();
        self.assert_in_shop();
        // [Effect] Extract orbs from shop (lower 30 bits)
        let orbs: Orbs = Self::get_shop_orbs(self.shop);
        let max_index: u32 = orbs.len();
        let quantity: u8 = indices.len().try_into().unwrap();
        while let Option::Some(index) = indices.pop_front() {
            // [Check] Index is within range
            let current: u32 = (*index).into();
            assert(current < max_index, Errors::GAME_INVALID_INDEX);
            // [Effect] Buy orb
            let orb = *orbs.at(current);
            let orb_id: u8 = orb.into();
            let base_cost = orb.cost();
            // [Compute] Get purchase count from shop field
            let purchase_count = Self::get_purchase_count(self.shop, orb_id);
            let multiplier = BASE_MULTIPLIER + (purchase_count.into() * SUPP_MULTIPLIER);
            // [Compute] Cost rounded up to the nearest integer
            let cost = (base_cost * multiplier + BASE_MULTIPLIER - 1) / BASE_MULTIPLIER;
            self.spend(cost);
            // [Effect] Increment purchase count in shop field
            self.shop = Self::inc_purchase_count(self.shop, orb_id);
            // [Effect] Add orb to the bag
            self.add(orb);
        }
        // [Effect] Increment counters
        // [Note] There is no need to track game purchases since it is not used
        let mut level_counters: Counters = self.level_counters();
        level_counters.buy(quantity);
        self.level_counters = level_counters.pack();
        // [Note] We track buying orbs at the game layer
        let mut game_counters: Counters = self.counters();
        game_counters.streak_save = 0;
        self.counters = game_counters.pack();
    }

    #[inline]
    fn exit(ref self: Game) {
        // [Check] Game state
        self.assert_not_over();
        self.assert_in_shop();
        // [Effect] Exit shop and enter the next stage
        self.level_up();
        self.restore();
        // Clear orbs and flags (bits 0-31) but preserve purchase counts (bits 32+)
        let purchase_shift: u128 = TwoPower::pow(PURCHASE_OFFSET).try_into().unwrap();
        self.shop = (self.shop / purchase_shift) * purchase_shift;
        // [Effect] Reset multiplier
        self.multiplier = BASE_MULTIPLIER;
        // [Effect] Apply a level-based curse for the new level
        match self.level {
            4 => {
                let curse = Curse::DoubleBomb;
                curse.apply(ref self);
            },
            6 => {
                let sticky = Curse::StickyBomb;
                sticky.apply(ref self);
            },
            7 => {
                let curse = Curse::DoubleBomb;
                curse.apply(ref self);
            },
            _ => {},
        }
        // [Effect] Update game counters
        let mut game_counters: Counters = self.counters();
        game_counters.streak_save += 1;
        self.counters = game_counters.pack();
    }

    #[inline]
    fn burn(ref self: Game, bag_index: u8) {
        // [Check] Game state
        self.assert_not_over();
        self.assert_in_shop();
        self.assert_burn_available();
        // [Check] Bag index is valid
        let bag: Orbs = OrbsTrait::unpack(self.bag);
        let bag_len: u8 = bag.len().try_into().unwrap();
        assert(bag_index < bag_len, Errors::GAME_INVALID_BAG_INDEX);
        // [Check] Cannot burn a bomb
        let orb = *bag.at(bag_index.into());
        assert(orb.one_if_bomb() == 0, Errors::GAME_CANNOT_BURN_BOMB);
        // [Effect] Spend chips
        self.spend(SHOP_ACTION_COST);
        // [Effect] Remove orb from bag
        let mut new_bag: Orbs = array![];
        let mut i: u8 = 0;
        while i < bag_len {
            if i != bag_index {
                new_bag.append(*bag.at(i.into()));
            }
            i += 1;
        }
        self.bag = new_bag.pack();
        // [Effect] Mark burn as used (bit 31)
        let burn_flag: u128 = TwoPower::pow(BURN_BIT).try_into().unwrap();
        self.shop = self.shop + burn_flag;
    }

    // Helper: Extract shop orbs from the lower 30 bits
    #[inline]
    fn get_shop_orbs(shop: u128) -> Orbs {
        let orbs_mask: u128 = TwoPower::pow(ORBS_BITS).try_into().unwrap() - 1;
        let packed_orbs: felt252 = (shop & orbs_mask).try_into().unwrap();
        OrbsTrait::unpack(packed_orbs)
    }

    // Helper: Get purchase count for an orb type from shop field
    #[inline]
    fn get_purchase_count(shop: u128, orb_id: u8) -> u8 {
        let bit_offset: u8 = PURCHASE_OFFSET + (orb_id * BITS_PER_PURCHASE);
        let shift: u128 = TwoPower::pow(bit_offset).try_into().unwrap();
        let mask: u128 = TwoPower::pow(BITS_PER_PURCHASE).try_into().unwrap() - 1;
        ((shop / shift) & mask).try_into().unwrap()
    }

    // Helper: Increment purchase count for an orb type in shop field
    #[inline]
    fn inc_purchase_count(shop: u128, orb_id: u8) -> u128 {
        let bit_offset: u8 = PURCHASE_OFFSET + (orb_id * BITS_PER_PURCHASE);
        let shift: u128 = TwoPower::pow(bit_offset).try_into().unwrap();
        shop + shift
    }

    // Helper: Check if refresh has been used
    #[inline]
    fn is_refresh_used(shop: u128) -> bool {
        let shift: u128 = TwoPower::pow(REFRESH_BIT).try_into().unwrap();
        (shop / shift) % 2 == 1
    }

    // Helper: Check if burn has been used
    #[inline]
    fn is_burn_used(shop: u128) -> bool {
        let shift: u128 = TwoPower::pow(BURN_BIT).try_into().unwrap();
        (shop / shift) % 2 == 1
    }

    // Helper: Check if a curse is active
    #[inline]
    fn has_curse(curses: u8, curse_bit: u8) -> bool {
        (curses / TwoPower::pow(curse_bit).try_into().unwrap()) % 2 == 1
    }

    // Helper: Add a curse
    #[inline]
    fn add_curse(ref self: Game, curse_bit: u8) {
        let mask: u8 = TwoPower::pow(curse_bit).try_into().unwrap();
        self.curses = self.curses | mask;
    }

    #[inline]
    fn pull(ref self: Game, seed: felt252) -> (Array<Orb>, u16, u32, u16) {
        // [Check] Game is not over
        self.assert_not_over();
        self.assert_not_completed();
        // [Effect] If all non-sticky orbs have been pulled, regenerate the bag
        let sticky_count = self.sticky_orbs_count();
        let should_reset = self.pullable_orbs_count() == sticky_count;
        if should_reset {
            self.discards = 0;
        }
        // [Effect] Pull orb(s) from the remaining orbs in the bag
        let bag: Orbs = OrbsTrait::unpack(self.bag);
        let mut deck: Deck = DeckTrait::from_bitmap(seed, bag.len(), self.discards.into());

        // [Info] Determine how many orbs to draw (2 if DoubleDraw curse is active)
        let draw_count: u8 = if Self::has_curse(self.curses, CURSE_DOUBLE_DRAW) {
            2
        } else {
            1
        };
        // [Effect] Draw orbs (up to draw_count, but stop if deck is empty)
        let mut pulled_orbs: Array<Orb> = array![];
        let mut total_earnings: u16 = 0;
        let mut draws_done: u8 = 0;
        let total_points: u16 = self.points;
        while draws_done < draw_count && deck.remaining > 0 {
            let index: u8 = deck.draw() - 1;
            let orb: Orb = *bag.at(index.into());
            // [Effect] Add the orb to the discards unless sticky
            if orb != Orb::StickyBomb {
                self.discards = Bitmap::set(self.discards, index);
            }
            // [Effect] Apply the orb
            let earnings = orb.apply(ref self);
            total_earnings += earnings;
            pulled_orbs.append(orb);
            draws_done += 1;
            // [Effect] Increment pull count
            self.pull_count += 1;
        }

        // [Effect] Assess the game
        self.over = if self.is_over() {
            starknet::get_block_timestamp()
        } else {
            self.over
        };

        // [Return] The pulled orbs and total earnings
        (pulled_orbs, total_earnings, deck.remaining, self.points - total_points)
    }

    #[inline]
    fn claim(ref self: Game) -> u256 {
        // [Check] Game is not claimed
        self.assert_not_claimed();
        // [Effect] Claim
        self.claimed = true;
        // [Return] Reward amount
        let reward: u256 = Rewarder::amount(self.moonrocks, self.stake);
        reward * self.stake.into()
    }
}

#[generate_trait]
pub impl GameAssert of AssertTrait {
    #[inline]
    fn assert_not_over(self: @Game) {
        assert(self.over == @0, Errors::GAME_IS_OVER);
    }

    #[inline]
    fn assert_is_over(self: @Game) {
        assert(self.over != @0, Errors::GAME_NOT_OVER);
    }

    #[inline]
    fn assert_has_started(self: @Game) {
        assert(self.expiration != @0, Errors::GAME_NOT_STARTED);
    }

    #[inline]
    fn assert_not_started(self: @Game) {
        assert(self.bag == @0, Errors::GAME_ALREADY_STARTED);
    }

    #[inline]
    fn assert_not_shop(self: @Game) {
        // Check only orb bits (0-29) — purchase counts in upper bits may persist
        let orbs_mask: u128 = TwoPower::pow(ORBS_BITS).try_into().unwrap() - 1;
        assert(*self.shop & orbs_mask == 0, Errors::GAME_IN_SHOP);
    }

    #[inline]
    fn assert_in_shop(self: @Game) {
        // Check only orb bits (0-29) — purchase counts in upper bits may persist
        let orbs_mask: u128 = TwoPower::pow(ORBS_BITS).try_into().unwrap() - 1;
        assert(*self.shop & orbs_mask != 0, Errors::GAME_NOT_SHOP);
    }

    #[inline]
    fn assert_refresh_available(self: @Game) {
        assert(!GameTrait::is_refresh_used(*self.shop), Errors::GAME_SHOP_REFRESH_USED);
    }

    #[inline]
    fn assert_burn_available(self: @Game) {
        assert(!GameTrait::is_burn_used(*self.shop), Errors::GAME_SHOP_BURN_USED);
    }

    #[inline]
    fn assert_is_completed(self: @Game) {
        assert(self.is_completed(), Errors::GAME_NOT_COMPLETED);
    }

    #[inline]
    fn assert_not_completed(self: @Game) {
        assert(!self.is_completed(), Errors::GAME_IS_COMPLETED);
    }

    #[inline]
    fn assert_can_afford(self: @Game, cost: u16) {
        assert(self.chips >= @cost, Errors::GAME_CANNOT_AFFORD);
    }

    #[inline]
    fn assert_can_afford_moonrocks(self: @Game, cost: u16) {
        assert(self.moonrocks >= @cost, Errors::GAME_CANNOT_AFFORD_MR);
    }

    #[inline]
    fn assert_not_full(self: @Game, len: u32) {
        assert(len < MAX_CAPACITY, Errors::GAME_BAG_FULL);
    }

    #[inline]
    fn assert_not_expired(self: @Game) {
        assert(!self.is_expired(), Errors::GAME_HAS_EXPIRED);
    }

    #[inline]
    fn assert_not_claimed(self: @Game) {
        assert(!*self.claimed, Errors::GAME_ALREADY_CLAIMED);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const GAME_ID: u64 = 1;
    const STAKE: u128 = 1;
    const SEED: felt252 = 'SEED';

    #[test]
    fn test_game_new() {
        let game = GameTrait::new(GAME_ID, STAKE);
        assert_eq!(game.id, GAME_ID);
        assert_eq!(game.over, 0);
        assert_eq!(game.level, DEFAULT_LEVEL);
        assert_eq!(game.health, MAX_HEALTH);
        assert_eq!(game.immunity, 0);
        assert_eq!(game.points, 0);
        assert_eq!(game.milestone, Milestone::get(DEFAULT_LEVEL));
        assert_eq!(game.multiplier, BASE_MULTIPLIER);
        assert_eq!(game.moonrocks, DEFAULT_MOONROCKS);
        assert_eq!(game.stake, STAKE);
    }

    #[test]
    fn test_game_start() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        let cost = game.start();
        assert_eq!(cost, Milestone::cost(DEFAULT_LEVEL));
        assert_eq!(game.bag != 0, true);
    }

    #[test]
    fn test_game_add() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        let bag = game.bag;
        game.add(Orb::Point5);
        assert_eq!(game.bag != bag, true);
        assert_eq!(game.bag != 0, true);
    }

    #[test]
    fn test_game_take_damage() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.take_damage(1);
        assert_eq!(game.health, MAX_HEALTH - 1);
    }

    #[test]
    fn test_game_earn_points() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.earn_points(10);
        assert_eq!(game.points, 10);
    }

    #[test]
    fn test_game_earn_chips() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.earn_chips(10);
        assert_eq!(game.chips, 10);
    }

    #[test]
    fn test_game_spend() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.earn_chips(20);
        game.spend(10);
        assert_eq!(game.chips, 10);
    }

    #[test]
    fn test_game_heal() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.take_damage(MAX_HEALTH - 1);
        game.heal(MAX_HEALTH - 1);
        assert_eq!(game.health, MAX_HEALTH);
    }

    #[test]
    fn test_game_restore() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.take_damage(MAX_HEALTH - 1);
        game.restore();
        assert_eq!(game.health, MAX_HEALTH);
    }

    #[test]
    fn test_game_level_up() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.level_up();
        assert_eq!(game.level, DEFAULT_LEVEL + 1);
    }

    #[test]
    fn test_game_immune() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.immune(1);
        assert_eq!(game.immunity, 1);
    }

    #[test]
    fn test_game_boost() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.boost(50);
        assert_eq!(game.multiplier, BASE_MULTIPLIER + 50);
    }

    #[test]
    fn test_game_pullable_orbs_count() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        let count = game.pullable_orbs_count();
        game.add(Orb::Point5);
        assert_eq!(game.pullable_orbs_count(), count + 1);
    }

    #[test]
    fn test_game_pulled_bombs_count() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        assert_eq!(game.pulled_bombs_count(), 0);
    }

    #[test]
    fn test_game_is_over() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.take_damage(MAX_HEALTH);
        assert_eq!(game.is_over(), true);
    }

    #[test]
    fn test_game_cash_out() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.earn_points(100);
        let cash = game.cash_out();
        assert_eq!(cash, 100);
        assert_eq!(game.over, 0);
    }

    #[test]
    fn test_game_enter() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.moonrocks = 100;
        game.earn_points(100);
        let cost = game.enter(1);
        assert_eq!(game.shop != 0, true);
        // Ante of 1 moonrock for level 2
        assert_eq!(cost, 1);
        assert_eq!(game.moonrocks, 99);
    }

    #[test]
    fn test_game_buy() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.earn_points(100);
        game.enter(SEED);
        // [Info] Buy from shop positions
        let mut indices: Span<u8> = [0, 3].span();
        game.buy(ref indices);
        // [Check] Still in shop
        assert_eq!(game.shop != 0, true);
    }

    #[test]
    fn test_game_buy_then_exit() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.moonrocks = 100;
        game.earn_points(100);
        game.enter(SEED);
        let mut indices: Span<u8> = [0].span();
        game.buy(ref indices);
        game.exit();
        // Orb bits (0-29) should be cleared, but purchase counts (32+) persist
        let orbs_mask: u128 = TwoPower::pow(ORBS_BITS).try_into().unwrap() - 1;
        assert_eq!(game.shop & orbs_mask, 0);
        // Purchase counts should be non-zero since we bought an orb
        assert_eq!(game.shop != 0, true);
    }

    #[test]
    fn test_game_burn() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.earn_points(100);
        game.enter(SEED);
        let old_bag = game.bag;
        // [Info] Burn a non-bomb orb (index 4 is Point5 in initial bag)
        game.burn(4);
        assert_eq!(game.bag != old_bag, true);
        assert_eq!(GameTrait::is_burn_used(game.shop), true);
        assert_eq!(game.chips, 100 - SHOP_ACTION_COST);
    }

    #[test]
    fn test_game_price_escalation() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.earn_points(200);
        game.enter(SEED);
        let initial_chips = game.chips;
        // [Info] Buy same position twice - second should cost 20% more
        let mut indices: Span<u8> = [0, 0].span();
        game.buy(ref indices);
        // [Check] Price escalated (base + base*1.2 rounded up)
        let orbs = GameTrait::get_shop_orbs(game.shop);
        let orb = *orbs.at(0);
        let base = orb.cost();
        let escalated = (base * 120 + 99) / 100; // Rounded up
        assert_eq!(game.chips, initial_chips - base - escalated);
    }

    #[test]
    #[should_panic(expected: 'Game: shop burn used')]
    fn test_game_burn_only_once() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.earn_points(100);
        game.enter(SEED);
        game.burn(4); // Burn Point5
        // [Check] Second burn should panic
        game.burn(5);
    }

    #[test]
    #[should_panic(expected: 'Game: cannot burn bomb')]
    fn test_game_cannot_burn_bomb() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.earn_points(100);
        game.enter(SEED);
        // [Check] Burning a bomb (index 0 is Bomb1) should panic
        game.burn(0);
    }

    #[test]
    fn test_game_purchase_counts_persist_across_shops() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.moonrocks = 500;
        game.earn_points(200);
        game.enter(SEED);
        // [Info] Get orb type at position 0 and buy it
        let orbs1 = GameTrait::get_shop_orbs(game.shop);
        let orb1 = *orbs1.at(0);
        let orb1_id: u8 = orb1.into();
        let mut indices: Span<u8> = [0].span();
        game.buy(ref indices);
        // [Check] Purchase count is 1 for that orb type
        assert_eq!(GameTrait::get_purchase_count(game.shop, orb1_id), 1);
        // [Effect] Exit and enter new shop
        game.exit();
        game.earn_points(200);
        game.enter('SHOP2');
        // [Check] Purchase count persists in new shop
        assert_eq!(GameTrait::get_purchase_count(game.shop, orb1_id), 1);
    }

    #[test]
    fn test_game_discards_reset_on_enter_shop() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.discards = 0b1011;
        game.earn_points(12); // Reach milestone to enter shop
        game.enter(SEED);
        assert_eq!(game.discards, 0);
    }

    #[test]
    fn test_game_escalation_persists_across_buy_calls() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.earn_points(200);
        game.enter(SEED);
        let orbs = GameTrait::get_shop_orbs(game.shop);
        let orb = *orbs.at(0);
        let base = orb.cost();
        // [Info] First buy
        let chips_before_1 = game.chips;
        let mut indices: Span<u8> = [0].span();
        game.buy(ref indices);
        assert_eq!(game.chips, chips_before_1 - base);
        // [Info] Second buy (same orb type) - should be escalated
        let chips_before_2 = game.chips;
        let mut indices: Span<u8> = [0].span();
        game.buy(ref indices);
        let escalated = (base * 120 + 99) / 100;
        assert_eq!(game.chips, chips_before_2 - escalated);
        // [Info] Third buy - escalates further
        let chips_before_3 = game.chips;
        let mut indices: Span<u8> = [0].span();
        game.buy(ref indices);
        let double_escalated = (base * 140 + 99) / 100;
        assert_eq!(game.chips, chips_before_3 - double_escalated);
    }

    #[test]
    fn test_game_burn_reduces_bag_size() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.earn_points(100);
        let bag_before: Orbs = OrbsTrait::unpack(game.bag);
        let size_before = bag_before.len();
        game.enter(SEED);
        game.burn(4);
        let bag_after: Orbs = OrbsTrait::unpack(game.bag);
        assert_eq!(bag_after.len(), size_before - 1);
    }

    #[test]
    #[should_panic(expected: 'Game: invalid bag index')]
    fn test_game_burn_invalid_index() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.earn_points(100);
        game.enter(SEED);
        // [Check] Burning out-of-bounds index should panic
        game.burn(100);
    }

    #[test]
    #[should_panic(expected: 'Game: cannot afford')]
    fn test_game_burn_insufficient_chips() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.earn_points(12); // Reach milestone to enter shop
        game.enter(SEED);
        // [Effect] Spend all chips except 3 (less than SHOP_ACTION_COST of 4)
        game.spend(game.chips - 3);
        // [Check] Burn without enough chips should panic
        game.burn(4);
    }

    // ==================== DoubleDraw Curse Tests ====================

    #[test]
    fn test_game_has_curse_false_by_default() {
        let game = GameTrait::new(GAME_ID, STAKE);
        assert_eq!(game.curses, 0);
        assert_eq!(GameTrait::has_curse(game.curses, CURSE_DOUBLE_DRAW), false);
    }

    #[test]
    fn test_game_add_curse() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        assert_eq!(GameTrait::has_curse(game.curses, CURSE_DOUBLE_DRAW), false);
        GameTrait::add_curse(ref game, CURSE_DOUBLE_DRAW);
        assert_eq!(GameTrait::has_curse(game.curses, CURSE_DOUBLE_DRAW), true);
    }

    #[test]
    fn test_game_pull_without_double_draw() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        // [Check] No curse active
        assert_eq!(GameTrait::has_curse(game.curses, CURSE_DOUBLE_DRAW), false);
        // [Effect] Pull orb
        let (orbs, _earnings, _remaining, _points) = game.pull(SEED);
        // [Check] Only 1 orb pulled
        assert_eq!(orbs.len().into(), 1);
    }

    #[test]
    fn test_game_pull_with_double_draw() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        // [Effect] Add DoubleDraw curse
        GameTrait::add_curse(ref game, CURSE_DOUBLE_DRAW);
        assert_eq!(GameTrait::has_curse(game.curses, CURSE_DOUBLE_DRAW), true);
        // [Effect] Pull orbs
        let (orbs, _earnings, _remaining, _points) = game.pull(SEED);
        // [Check] 2 orbs pulled due to DoubleDraw curse
        assert_eq!(orbs.len().into(), 2);
    }

    #[test]
    fn test_game_pull_double_draw_updates_discards() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        let discards_before = game.discards;
        // [Effect] Add DoubleDraw curse and pull
        GameTrait::add_curse(ref game, CURSE_DOUBLE_DRAW);
        let (orbs, _earnings, _remaining, _points) = game.pull(SEED);
        // [Check] 2 orbs pulled and discards updated for both
        assert_eq!(orbs.len().into(), 2);
        // Discards should have 2 bits set (2 orbs pulled)
        assert_eq!(Bitmap::popcount(game.discards), Bitmap::popcount(discards_before) + 2);
    }

    #[test]
    fn test_game_pull_double_draw_when_only_one_orb_left() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        // [Effect] Add DoubleDraw curse
        GameTrait::add_curse(ref game, CURSE_DOUBLE_DRAW);
        // [Effect] Pull until only 1 orb remains (initial bag has 11 orbs)
        // Pull 5 times (each pulls 2) = 10 orbs, leaving 1
        let mut i: u8 = 0;
        while i < 5 && game.over == 0 {
            game.pull(SEED + i.into());
            game.points = 0; // Reset points to avoid milestone
            i += 1;
        }
        // [Check] If not dead, pull the last orb
        if game.over == 0 {
            let pullable = game.pullable_orbs_count();
            if pullable > 0 {
                let (orbs, _, _, _) = game.pull('FINAL');
                // [Check] Should only pull what's available (1 orb max)
                assert!(orbs.len() <= pullable.into());
            }
        }
    }

    // ==================== Demultiplier Curse Tests ====================

    #[test]
    fn test_game_demultiplier_curse_not_active_by_default() {
        let game = GameTrait::new(GAME_ID, STAKE);
        assert_eq!(GameTrait::has_curse(game.curses, CURSE_DEMULTIPLIER), false);
    }

    #[test]
    fn test_game_add_demultiplier_curse() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        assert_eq!(GameTrait::has_curse(game.curses, CURSE_DEMULTIPLIER), false);
        GameTrait::add_curse(ref game, CURSE_DEMULTIPLIER);
        assert_eq!(GameTrait::has_curse(game.curses, CURSE_DEMULTIPLIER), true);
    }

    #[test]
    fn test_game_boost_without_demultiplier() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        let multiplier_before = game.multiplier;
        // [Effect] Boost without curse
        game.boost(50);
        // [Check] Full boost applied
        assert_eq!(game.multiplier, multiplier_before + 50);
    }

    #[test]
    fn test_game_boost_with_demultiplier() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        let multiplier_before = game.multiplier;
        // [Effect] Add Demultiplier curse
        GameTrait::add_curse(ref game, CURSE_DEMULTIPLIER);
        // [Effect] Boost with curse active
        game.boost(50);
        // [Check] Only half boost applied (50 / 2 = 25)
        assert_eq!(game.multiplier, multiplier_before + 25);
    }

    #[test]
    fn test_game_boost_with_demultiplier_odd_value() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        let multiplier_before = game.multiplier;
        // [Effect] Add Demultiplier curse
        GameTrait::add_curse(ref game, CURSE_DEMULTIPLIER);
        // [Effect] Boost with odd value (rounds down)
        game.boost(51);
        // [Check] Half boost applied (51 / 2 = 25, integer division)
        assert_eq!(game.multiplier, multiplier_before + 25);
    }

    #[test]
    fn test_game_multiple_curses_active() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        // [Effect] Add both curses
        GameTrait::add_curse(ref game, CURSE_DOUBLE_DRAW);
        GameTrait::add_curse(ref game, CURSE_DEMULTIPLIER);
        // [Check] Both curses are active
        assert_eq!(GameTrait::has_curse(game.curses, CURSE_DOUBLE_DRAW), true);
        assert_eq!(GameTrait::has_curse(game.curses, CURSE_DEMULTIPLIER), true);
        // [Check] DoubleDraw still works (pulls 2 orbs)
        let (orbs, _earnings, _remaining, _points) = game.pull(SEED);
        assert_eq!(orbs.len().into(), 2);
        // [Check] Demultiplier still works (halves boost)
        let multiplier_before = game.multiplier;
        game.boost(100);
        assert_eq!(game.multiplier, multiplier_before + 50);
    }

    // ==================== Bag Regeneration Tests ====================

    #[test]
    fn test_game_bag_reshuffles_when_empty() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        let bag: Orbs = OrbsTrait::unpack(game.bag);
        let bag_size: u8 = bag.len().try_into().unwrap();
        // [Effect] Pull all orbs (without dying)
        let mut i: u8 = 0;
        while i < bag_size && game.over == 0 {
            game.pull(SEED + i.into());
            game.points = 0; // Reset points to avoid milestone
            i += 1;
        }
        // [Check] If not dead, all orbs should be discarded
        if game.over == 0 {
            assert_eq!(game.pullable_orbs_count(), 0);
            // [Effect] Pull again - should reshuffle (reset discards)
            game.pull('RESHUFFLE');
            // [Check] Discards was reset, now bag_size - 1 orbs available
            assert_eq!(game.pullable_orbs_count(), bag_size - 1);
        }
    }

    #[test]
    fn test_game_bag_keeps_added_orbs_after_reshuffle() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        let bag: Orbs = OrbsTrait::unpack(game.bag);
        let initial_bag_size: u8 = bag.len().try_into().unwrap();
        // [Effect] Add an orb (simulating shop purchase)
        game.add(Orb::Point5);
        let new_bag: Orbs = OrbsTrait::unpack(game.bag);
        let new_bag_size: u8 = new_bag.len().try_into().unwrap();
        assert_eq!(new_bag_size, initial_bag_size + 1);
        // [Effect] Pull all orbs (without dying)
        let mut i: u8 = 0;
        while i < new_bag_size && game.over == 0 {
            game.pull(SEED + i.into());
            game.points = 0;
            i += 1;
        }
        // [Check] If not dead, reshuffle should keep the added orb
        if game.over == 0 {
            assert_eq!(game.pullable_orbs_count(), 0);
            game.pull('RESHUFFLE');
            // [Check] Bag still has the added orb (new_bag_size - 1 pullable after 1 pull)
            assert_eq!(game.pullable_orbs_count(), new_bag_size - 1);
            // [Check] Bag contents unchanged
            let reshuffled_bag: Orbs = OrbsTrait::unpack(game.bag);
            assert_eq!(reshuffled_bag.len(), new_bag_size.into());
        }
    }

    #[test]
    fn test_game_reshuffle_resets_discards() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        let bag: Orbs = OrbsTrait::unpack(game.bag);
        let bag_size: u8 = bag.len().try_into().unwrap();
        // [Effect] Pull all orbs
        let mut i: u8 = 0;
        while i < bag_size && game.over == 0 {
            game.pull(SEED + i.into());
            game.points = 0;
            i += 1;
        }
        // [Check] If survived, discards should be full
        if game.over == 0 {
            let discards_before = game.discards;
            assert!(discards_before > 0);
            // [Effect] Pull to trigger reshuffle
            game.pull('TRIGGER');
            // [Check] After reshuffle + 1 pull, discards should be much smaller
            assert!(game.discards < discards_before);
        }
    }

    // ==================== Curse on Level Up Tests ====================

    #[test]
    fn test_game_exit_applies_double_bomb_on_level_4() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.moonrocks = 5000;
        // [Info] Advance to level 4
        game.points = Milestone::get(game.level);
        game.enter(SEED);
        game.exit();
        game.points = Milestone::get(game.level);
        game.enter('L3_IN');
        game.exit();
        game.points = Milestone::get(game.level);
        game.enter('L4_IN');
        let bag_len_before: u32 = OrbsTrait::unpack(game.bag).len();
        // [Effect] Exit to level 4 (should add DoubleBomb)
        game.exit();
        assert_eq!(game.level, 4);
        let bag_len_after: u32 = OrbsTrait::unpack(game.bag).len();
        assert_eq!(bag_len_after, bag_len_before + 1);
        let bag: Orbs = OrbsTrait::unpack(game.bag);
        let last_orb = *bag.at(bag_len_after - 1);
        assert_eq!(last_orb, Orb::Bomb2);
    }

    #[test]
    fn test_game_exit_applies_sticky_bomb_on_level_6() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.moonrocks = 5000;
        // [Info] Advance to level 6
        game.points = Milestone::get(game.level);
        game.enter(SEED);
        game.exit();
        game.points = Milestone::get(game.level);
        game.enter('L3_IN');
        game.exit();
        game.points = Milestone::get(game.level);
        game.enter('L4_IN');
        game.exit();
        game.points = Milestone::get(game.level);
        game.enter('L5_IN');
        game.exit();
        game.points = Milestone::get(game.level);
        game.enter('L6_IN');
        let bag_len_before: u32 = OrbsTrait::unpack(game.bag).len();
        // [Effect] Exit to level 6 (adds StickyBomb)
        game.exit();
        assert_eq!(game.level, 6);
        let bag_len_after: u32 = OrbsTrait::unpack(game.bag).len();
        assert_eq!(bag_len_after, bag_len_before + 1);
        let bag: Orbs = OrbsTrait::unpack(game.bag);
        let last_orb = *bag.at(bag_len_after - 1);
        assert_eq!(last_orb, Orb::StickyBomb);
    }

    #[test]
    fn test_game_exit_applies_double_bomb_on_level_7() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        game.moonrocks = 5000;
        // [Info] Advance to level 7
        game.points = Milestone::get(game.level);
        game.enter(SEED);
        game.exit();
        game.points = Milestone::get(game.level);
        game.enter('L3_IN');
        game.exit();
        game.points = Milestone::get(game.level);
        game.enter('L4_IN');
        game.exit();
        game.points = Milestone::get(game.level);
        game.enter('L5_IN');
        game.exit();
        game.points = Milestone::get(game.level);
        game.enter('L6_IN');
        game.exit();
        game.points = Milestone::get(game.level);
        game.enter('L7_IN');
        let bag_len_before: u32 = OrbsTrait::unpack(game.bag).len();
        // [Effect] Exit to level 7 (adds DoubleBomb)
        game.exit();
        assert_eq!(game.level, 7);
        let bag_len_after: u32 = OrbsTrait::unpack(game.bag).len();
        assert_eq!(bag_len_after, bag_len_before + 1);
        let bag: Orbs = OrbsTrait::unpack(game.bag);
        let last_orb = *bag.at(bag_len_after - 1);
        assert_eq!(last_orb, Orb::Bomb2);
    }

    #[test]
    fn test_curse_demultiplier_apply() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        // [Effect] Apply Demultiplier curse directly
        let curse: Curse = 1_u8.into(); // Demultiplier
        curse.apply(ref game);
        // [Check] Demultiplier curse is active
        assert_eq!(GameTrait::has_curse(game.curses, CURSE_DEMULTIPLIER), true);
    }

    #[test]
    fn test_curse_double_draw_apply() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        // [Effect] Apply DoubleDraw curse directly
        let curse: Curse = 2_u8.into(); // DoubleDraw
        curse.apply(ref game);
        // [Check] DoubleDraw curse is active
        assert_eq!(GameTrait::has_curse(game.curses, CURSE_DOUBLE_DRAW), true);
    }

    #[test]
    fn test_curse_sticky_bomb_apply() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        let bag_len_before: u32 = OrbsTrait::unpack(game.bag).len();
        // [Effect] Apply StickyBomb curse directly
        let curse: Curse = 6_u8.into(); // StickyBomb
        curse.apply(ref game);
        // [Check] Bag size increased (StickyBomb added)
        let bag_len_after: u32 = OrbsTrait::unpack(game.bag).len();
        assert_eq!(bag_len_after, bag_len_before + 1);
        let bag: Orbs = OrbsTrait::unpack(game.bag);
        let last_orb = *bag.at(bag_len_after - 1);
        assert_eq!(last_orb, Orb::StickyBomb);
    }

    #[test]
    fn test_curse_double_bomb_apply() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        let bag_len_before: u32 = OrbsTrait::unpack(game.bag).len();
        // [Effect] Apply DoubleBomb curse directly
        let curse: Curse = 3_u8.into(); // DoubleBomb
        curse.apply(ref game);
        // [Check] Bag size increased (Bomb2 added)
        let bag_len_after: u32 = OrbsTrait::unpack(game.bag).len();
        assert_eq!(bag_len_after, bag_len_before + 1);
        // [Check] Last orb in bag is Bomb2
        let bag: Orbs = OrbsTrait::unpack(game.bag);
        let last_orb = *bag.at(bag_len_after - 1);
        assert_eq!(last_orb, Orb::Bomb2);
    }

    #[test]
    fn test_curse_normal_bomb_apply() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        let bag_len_before: u32 = OrbsTrait::unpack(game.bag).len();
        // [Effect] Apply NormalBomb curse directly
        let curse: Curse = 4_u8.into(); // NormalBomb
        curse.apply(ref game);
        // [Check] Bag size increased (Bomb1 added)
        let bag_len_after: u32 = OrbsTrait::unpack(game.bag).len();
        assert_eq!(bag_len_after, bag_len_before + 1);
        // [Check] Last orb in bag is Bomb1
        let bag: Orbs = OrbsTrait::unpack(game.bag);
        let last_orb = *bag.at(bag_len_after - 1);
        assert_eq!(last_orb, Orb::Bomb1);
    }

    #[test]
    fn test_curse_score_decrease_apply() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        let bag_len_before: u32 = OrbsTrait::unpack(game.bag).len();
        // [Effect] Apply ScoreDecrease curse directly
        let curse: Curse = 5_u8.into(); // ScoreDecrease
        curse.apply(ref game);
        // [Check] Bag size increased (CurseScoreDecrease added)
        let bag_len_after: u32 = OrbsTrait::unpack(game.bag).len();
        assert_eq!(bag_len_after, bag_len_before + 1);
        // [Check] Last orb in bag is CurseScoreDecrease
        let bag: Orbs = OrbsTrait::unpack(game.bag);
        let last_orb = *bag.at(bag_len_after - 1);
        assert_eq!(last_orb, Orb::CurseScoreDecrease);
    }

    #[test]
    fn test_game_sticky_bomb_keeps_bomb_pullable() {
        let mut game = GameTrait::new(GAME_ID, STAKE);
        game.start();
        // [Setup] Replace bag with a single bomb for deterministic pulls
        game.bag = array![Orb::StickyBomb].pack();
        game.discards = 0;
        let (orbs_first, _, _, _) = game.pull(SEED);
        assert_eq!(orbs_first.len(), 1);
        assert_eq!(game.discards, 0);
        assert_eq!(game.pullable_orbs_count(), 1);
        let (orbs_second, _, _, _) = game.pull('SECOND');
        assert_eq!(orbs_second.len(), 1);
    }
}
