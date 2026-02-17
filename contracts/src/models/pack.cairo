use crate::constants::{DEFAULT_GAMES_COUNT, DEFAULT_MOONROCKS, PACK_EXPIRY_DURATION};
pub use crate::models::index::Pack;

pub mod ERRORS {
    pub const PACK_ALREADY_OPEN: felt252 = 'Pack: already open';
    pub const PACK_NOT_OPEN: felt252 = 'Pack: not open';
    pub const PACK_IS_OVER: felt252 = 'Pack: is over';
    pub const PACK_NOT_OVER: felt252 = 'Pack: not over';
    pub const PACK_CANNOT_AFFORD: felt252 = 'Pack: not enough moonrocks';
    pub const PACK_EXPIRED: felt252 = 'Pack: expired';
}

#[generate_trait]
pub impl PackImpl of PackTrait {
    #[inline]
    fn new(id: u64, entry_cost: u16, created_at: u64) -> Pack {
        Pack {
            id: id,
            game_count: 0,
            moonrocks: DEFAULT_MOONROCKS,
            entry_cost: entry_cost,
            created_at: created_at,
        }
    }

    #[inline]
    fn is_over(self: @Pack) -> bool {
        self.game_count >= @DEFAULT_GAMES_COUNT
    }

    #[inline]
    fn is_expired(self: @Pack) -> bool {
        starknet::get_block_timestamp() > *self.created_at + PACK_EXPIRY_DURATION
    }

    #[inline]
    fn open(ref self: Pack) -> u8 {
        // [Check] State
        self.assert_not_over();
        // [Effect] Next game
        self.game_count += 1;
        self.game_count
    }

    #[inline]
    fn earn(ref self: Pack, earnings: u16) {
        self.moonrocks += earnings;
    }

    #[inline]
    fn spend(ref self: Pack, cost: u16) {
        // [Check] Pack can afford
        self.assert_can_afford(cost);
        // [Effect] Spend moonrocks
        self.moonrocks -= cost;
    }
}

#[generate_trait]
pub impl PackAssert of AssertTrait {
    #[inline]
    fn assert_not_over(self: @Pack) {
        assert(!self.is_over(), ERRORS::PACK_IS_OVER);
    }

    #[inline]
    fn assert_is_over(self: @Pack) {
        assert(self.is_over(), ERRORS::PACK_NOT_OVER);
    }

    #[inline]
    fn assert_not_expired(self: @Pack) {
        assert(!self.is_expired(), ERRORS::PACK_EXPIRED);
    }

    #[inline]
    fn assert_can_afford(self: @Pack, cost: u16) {
        assert(self.moonrocks >= @cost, ERRORS::PACK_CANNOT_AFFORD);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pack_open() {
        let mut pack = PackTrait::new(1, 2, 0);
        assert_eq!(pack.open(), 1);
        assert_eq!(pack.open(), 2);
        pack.assert_not_over();
    }

    #[test]
    fn test_pack_is_over() {
        let mut pack = PackTrait::new(1, 2, 0);
        for _ in 0..DEFAULT_GAMES_COUNT {
            pack.open();
        }
        assert!(pack.is_over());
        pack.assert_is_over();
    }

    #[test]
    fn test_pack_is_not_over() {
        let mut pack = PackTrait::new(1, 2, 0);
        for _ in 0..DEFAULT_GAMES_COUNT - 1 {
            pack.open();
        }
        assert!(!pack.is_over());
        pack.assert_not_over();
    }
}
