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
pub const SHOP_ACTION_COST: u16 = 4;

// Shop field bit layout (u128):
// Bits 0-29: 6 orbs * 5 bits = orb types
// Bit 30: refresh_used flag
// Bit 31: burn_used flag
// Bits 32-91: 20 orb types * 3 bits = purchase counts (up to 7 each)
const ORBS_BITS: u8 = 30;
const REFRESH_BIT: u8 = 30;
const BURN_BIT: u8 = 31;
const PURCHASE_OFFSET: u8 = 32;
const BITS_PER_PURCHASE: u8 = 3;

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
    pub const GAME_SHOP_REFRESH_USED: felt252 = 'Game: shop refresh used';
    pub const GAME_SHOP_BURN_USED: felt252 = 'Game: shop burn used';
    pub const GAME_CANNOT_BURN_BOMB: felt252 = 'Game: cannot burn bomb';
    pub const GAME_INVALID_BAG_INDEX: felt252 = 'Game: invalid bag index';
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
            discards: 0,
            bag: 0,
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
        // [Effect] Generate and set the shop (orbs in bits 0-29, flags/counts reset)
        let orbs: Orbs = OrbsTrait::shop(seed);
        let packed_orbs: u128 = orbs.pack().try_into().expect('Shop: packing failed');
        self.shop = packed_orbs; // Only orbs, flags and counts are 0
        // [Effect] Convert points to chips
        self.earn_chips(self.points);
        self.points = 0;
    }

    #[inline]
    fn buy(ref self: Game, ref indices: Span<u8>) {
        // [Check] Game state
        self.assert_not_over();
        self.assert_in_shop();
        // [Effect] Extract orbs from shop (lower 30 bits)
        let orbs: Orbs = Self::get_shop_orbs(self.shop);
        let max_index: u32 = orbs.len();
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
        };
    }

    #[inline]
    fn exit(ref self: Game) -> u16 {
        // [Check] Game state
        self.assert_not_over();
        self.assert_in_shop();
        // [Effect] Exit shop and enter the next stage
        self.level_up();
        self.restore();
        self.shop = 0;
        // [Return] Entry fee
        Milestone::cost(self.level)
    }

    #[inline]
    fn refresh(ref self: Game, seed: felt252) {
        // [Check] Game state
        self.assert_not_over();
        self.assert_in_shop();
        self.assert_refresh_available();
        // [Effect] Spend chips
        self.spend(SHOP_ACTION_COST);
        // [Effect] Generate new shop orbs
        let orbs: Orbs = OrbsTrait::shop(seed);
        let packed_orbs: u128 = orbs.pack().try_into().expect('Shop: packing failed');
        // [Effect] Set new orbs + mark refresh used (bit 30), reset purchase counts
        self.shop = packed_orbs + TwoPower::pow(REFRESH_BIT);
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
        self.shop = self.shop + TwoPower::pow(BURN_BIT);
    }

    // Helper: Extract shop orbs from the lower 30 bits
    #[inline]
    fn get_shop_orbs(shop: u128) -> Orbs {
        let orbs_mask: u128 = TwoPower::pow(ORBS_BITS) - 1;
        let packed_orbs: felt252 = (shop & orbs_mask).try_into().unwrap();
        OrbsTrait::unpack(packed_orbs)
    }

    // Helper: Get purchase count for an orb type from shop field
    #[inline]
    fn get_purchase_count(shop: u128, orb_id: u8) -> u8 {
        let bit_offset: u8 = PURCHASE_OFFSET + (orb_id * BITS_PER_PURCHASE);
        let shift: u128 = TwoPower::pow(bit_offset);
        let mask: u128 = TwoPower::pow(BITS_PER_PURCHASE) - 1;
        ((shop / shift) & mask).try_into().unwrap()
    }

    // Helper: Increment purchase count for an orb type in shop field
    #[inline]
    fn inc_purchase_count(shop: u128, orb_id: u8) -> u128 {
        let bit_offset: u8 = PURCHASE_OFFSET + (orb_id * BITS_PER_PURCHASE);
        let shift: u128 = TwoPower::pow(bit_offset);
        shop + shift
    }

    // Helper: Check if refresh has been used
    #[inline]
    fn is_refresh_used(shop: u128) -> bool {
        let shift: u128 = TwoPower::pow(REFRESH_BIT);
        (shop / shift) % 2 == 1
    }

    // Helper: Check if burn has been used
    #[inline]
    fn is_burn_used(shop: u128) -> bool {
        let shift: u128 = TwoPower::pow(BURN_BIT);
        (shop / shift) % 2 == 1
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
    fn assert_refresh_available(self: @Game) {
        assert(!GameTrait::is_refresh_used(*self.shop), Errors::GAME_SHOP_REFRESH_USED);
    }

    #[inline]
    fn assert_burn_available(self: @Game) {
        assert(!GameTrait::is_burn_used(*self.shop), Errors::GAME_SHOP_BURN_USED);
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
        // [Info] Buy from shop positions
        let mut indices: Span<u8> = [0, 3].span();
        game.buy(ref indices);
        // [Check] Still in shop
        assert_eq!(game.shop != 0, true);
    }

    #[test]
    fn test_game_buy_then_exit() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        game.earn_points(100);
        game.enter(SEED);
        let mut indices: Span<u8> = [0].span();
        game.buy(ref indices);
        let cost = game.exit();
        assert_eq!(game.shop, 0);
        assert_eq!(cost, Milestone::cost(DEFAULT_LEVEL + 1));
    }

    #[test]
    fn test_game_refresh() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
        game.start();
        game.earn_points(100);
        game.enter(SEED);
        let old_shop = game.shop;
        game.refresh('NEW_SEED');
        // [Check] Shop changed and refresh flag is set
        assert_eq!(game.shop != old_shop, true);
        assert_eq!(GameTrait::is_refresh_used(game.shop), true);
        assert_eq!(game.chips, 100 - SHOP_ACTION_COST);
    }

    #[test]
    fn test_game_burn() {
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
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
        let mut game = GameTrait::new(PACK_ID, GAME_ID);
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
}

