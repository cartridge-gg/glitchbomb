use core::num::traits::Pow;
use crate::types::orb::Orb;

// Constants

const TWO_POW_8: u128 = 2_u128.pow(8);
const TWO_POW_16: u128 = 2_u128.pow(16);
const TWO_POW_24: u128 = 2_u128.pow(24);
const TWO_POW_32: u128 = 2_u128.pow(32);
const TWO_POW_40: u128 = 2_u128.pow(40);
const TWO_POW_48: u128 = 2_u128.pow(48);
const TWO_POW_56: u128 = 2_u128.pow(56);
const TWO_POW_64: u128 = 2_u128.pow(64);
const TWO_POW_72: u128 = 2_u128.pow(72);
const TWO_POW_80: u128 = 2_u128.pow(80);
const TWO_POW_88: u128 = 2_u128.pow(88);
const TWO_POW_96: u128 = 2_u128.pow(96);
const TWO_POW_104: u128 = 2_u128.pow(104);

#[derive(Copy, Drop, PartialEq)]
pub struct Counters {
    // Counts
    pub pull_count: u16,
    pub buy_count: u8,
    pub bomb_count: u8,
    pub bomb3_count: u8,
    // Amounts
    pub point_amount: u16,
    pub moonrock_amount: u16,
    pub health_amount: u16,
    // Streaks
    pub streak_bombs: u8,
    pub streak_multipliers: u8,
    pub streak_save: u8,
}

#[generate_trait]
pub impl CountersImpl of CountersTrait {
    #[inline]
    fn new(
        pull_count: u16,
        buy_count: u8,
        bomb_count: u8,
        bomb3_count: u8,
        point_amount: u16,
        moonrock_amount: u16,
        health_amount: u16,
        streak_bombs: u8,
        streak_multipliers: u8,
        streak_save: u8,
    ) -> Counters {
        Counters {
            pull_count,
            buy_count,
            bomb_count,
            bomb3_count,
            point_amount,
            moonrock_amount,
            health_amount,
            streak_bombs,
            streak_multipliers,
            streak_save,
        }
    }

    #[inline]
    fn add(ref self: Counters, orb: Orb, quantity: u16) {
        self.pull_count += 1;
        match orb {
            Orb::Bomb1 => {
                self.bomb_count += 1;
                self.streak_bombs += 1;
                self.streak_multipliers = 0;
            },
            Orb::Bomb2 => {
                self.bomb_count += 1;
                self.streak_bombs += 1;
                self.streak_multipliers = 0;
            },
            Orb::Bomb3 => {
                self.bomb_count += 1;
                self.bomb3_count += 1;
                self.streak_bombs += 1;
                self.streak_multipliers = 0;
            },
            Orb::StickyBomb => {
                self.bomb_count += 1;
                self.streak_bombs += 1;
                self.streak_multipliers = 0;
            },
            Orb::Health1 => {
                self.health_amount += quantity;
                self.streak_bombs = 0;
                self.streak_multipliers = 0;
            },
            Orb::Health2 => {
                self.health_amount += quantity;
                self.streak_bombs = 0;
                self.streak_multipliers = 0;
            },
            Orb::Health3 => {
                self.health_amount += quantity;
                self.streak_bombs = 0;
                self.streak_multipliers = 0;
            },
            Orb::Multiplier50 => {
                self.streak_multipliers += 1;
                self.streak_bombs = 0;
            },
            Orb::Multiplier100 => {
                self.streak_multipliers += 1;
                self.streak_bombs = 0;
            },
            Orb::Multiplier150 => {
                self.streak_multipliers += 1;
                self.streak_bombs = 0;
            },
            Orb::Point5 => {
                self.point_amount += quantity;
                self.streak_multipliers = 0;
            },
            Orb::Point6 => {
                self.point_amount += quantity;
                self.streak_multipliers = 0;
            },
            Orb::Point7 => {
                self.point_amount += quantity;
                self.streak_multipliers = 0;
            },
            Orb::Point8 => {
                self.point_amount += quantity;
                self.streak_multipliers = 0;
            },
            Orb::Point9 => {
                self.point_amount += quantity;
                self.streak_multipliers = 0;
            },
            Orb::PointOrb1 => {
                self.point_amount += quantity;
                self.streak_multipliers = 0;
            },
            Orb::PointBomb4 => {
                self.point_amount += quantity;
                self.streak_multipliers = 0;
            },
            Orb::Moonrock15 => {
                self.moonrock_amount += quantity;
                self.streak_multipliers = 0;
            },
            Orb::Moonrock40 => {
                self.moonrock_amount += quantity;
                self.streak_multipliers = 0;
            },
            _ => {
                self.streak_multipliers = 0;
                self.streak_bombs = 0;
            },
        }
    }

    #[inline]
    fn buy(ref self: Counters, quantity: u8) {
        self.buy_count += quantity;
    }

    #[inline]
    fn pack(self: Counters) -> u128 {
        self.pull_count.into()
            + self.buy_count.into() * TWO_POW_16
            + self.bomb_count.into() * TWO_POW_24
            + self.bomb3_count.into() * TWO_POW_32
            + self.point_amount.into() * TWO_POW_40
            + self.moonrock_amount.into() * TWO_POW_56
            + self.health_amount.into() * TWO_POW_72
            + self.streak_bombs.into() * TWO_POW_88
            + self.streak_multipliers.into() * TWO_POW_96
            + self.streak_save.into() * TWO_POW_104
    }

    #[inline]
    fn unpack(self: u128) -> Counters {
        let (packed, pull_count) = DivRem::div_rem(self, TWO_POW_16.try_into().unwrap());
        let (packed, buy_count) = DivRem::div_rem(packed, TWO_POW_8.try_into().unwrap());
        let (packed, bomb_count) = DivRem::div_rem(packed, TWO_POW_8.try_into().unwrap());
        let (packed, bomb3_count) = DivRem::div_rem(packed, TWO_POW_8.try_into().unwrap());
        let (packed, point_amount) = DivRem::div_rem(packed, TWO_POW_16.try_into().unwrap());
        let (packed, moonrock_amount) = DivRem::div_rem(packed, TWO_POW_16.try_into().unwrap());
        let (packed, health_amount) = DivRem::div_rem(packed, TWO_POW_16.try_into().unwrap());
        let (packed, streak_bombs) = DivRem::div_rem(packed, TWO_POW_8.try_into().unwrap());
        let (packed, streak_multipliers) = DivRem::div_rem(packed, TWO_POW_8.try_into().unwrap());
        let (_, streak_save) = DivRem::div_rem(packed, TWO_POW_8.try_into().unwrap());
        Counters {
            pull_count: pull_count.try_into().unwrap(),
            buy_count: buy_count.try_into().unwrap(),
            bomb_count: bomb_count.try_into().unwrap(),
            bomb3_count: bomb3_count.try_into().unwrap(),
            point_amount: point_amount.try_into().unwrap(),
            moonrock_amount: moonrock_amount.try_into().unwrap(),
            health_amount: health_amount.try_into().unwrap(),
            streak_bombs: streak_bombs.try_into().unwrap(),
            streak_multipliers: streak_multipliers.try_into().unwrap(),
            streak_save: streak_save.try_into().unwrap(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_counters_pack_unpack() {
        let counters = Counters {
            pull_count: 1,
            buy_count: 2,
            bomb_count: 3,
            bomb3_count: 4,
            point_amount: 5,
            moonrock_amount: 6,
            health_amount: 7,
            streak_bombs: 8,
            streak_multipliers: 9,
            streak_save: 10,
        };
        let packed: u128 = counters.pack();
        let unpacked: Counters = packed.unpack();
        assert_eq!(counters.pull_count, unpacked.pull_count, "Counters: pull_count mismatch");
        assert_eq!(counters.buy_count, unpacked.buy_count, "Counters: buy_count mismatch");
        assert_eq!(counters.bomb_count, unpacked.bomb_count, "Counters: bomb_count mismatch");
        assert_eq!(counters.bomb3_count, unpacked.bomb3_count, "Counters: bomb3_count mismatch");
        assert_eq!(counters.point_amount, unpacked.point_amount, "Counters: point_amount mismatch");
        assert_eq!(
            counters.moonrock_amount,
            unpacked.moonrock_amount,
            "Counters: moonrock_amount mismatch",
        );
        assert_eq!(
            counters.health_amount, unpacked.health_amount, "Counters: health_amount mismatch",
        );
        assert_eq!(counters.streak_bombs, unpacked.streak_bombs, "Counters: streak_bombs mismatch");
        assert_eq!(
            counters.streak_multipliers,
            unpacked.streak_multipliers,
            "Counters: streak_multipliers mismatch",
        );
        assert_eq!(counters.streak_save, unpacked.streak_save, "Counters: streak_save mismatch");
    }
}
