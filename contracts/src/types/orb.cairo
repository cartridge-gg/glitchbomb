use crate::elements::effects::lose::LOSS_PERCENT;
use crate::models::game::{Game, GameTrait};
use crate::types::effect::{Effect, EffectTrait};

#[derive(Drop, Copy, PartialEq, Debug)]
pub enum Orb {
    None,
    Bomb1,
    Bomb2,
    Bomb3,
    StickyBomb,
    Health1,
    Health2,
    Health3,
    Multiplier50,
    Multiplier100,
    Multiplier150,
    Point5,
    Point6,
    Point7,
    Point8,
    Point9,
    PointOrb1,
    PointBomb4,
    Moonrock15,
    Moonrock40,
    Chips15,
    CurseScoreDecrease // Curse orb: reduces score
}

#[generate_trait]
pub impl OrbImpl of OrbTrait {
    #[inline]
    fn apply(self: @Orb, ref game: Game) -> u16 {
        match self {
            Orb::Bomb1 => Effect::Explode.apply(ref game, 1),
            Orb::Bomb2 => Effect::Explode.apply(ref game, 2),
            Orb::Bomb3 => Effect::Explode.apply(ref game, 3),
            Orb::StickyBomb => Effect::Explode.apply(ref game, 1),
            Orb::Health1 => Effect::Heal.apply(ref game, 1),
            Orb::Health2 => Effect::Heal.apply(ref game, 2),
            Orb::Health3 => Effect::Heal.apply(ref game, 3),
            Orb::Multiplier50 => Effect::Boost.apply(ref game, 50),
            Orb::Multiplier100 => Effect::Boost.apply(ref game, 100),
            Orb::Multiplier150 => Effect::Boost.apply(ref game, 150),
            Orb::Point5 => Effect::Earn.apply(ref game, 5),
            Orb::Point6 => Effect::Earn.apply(ref game, 6),
            Orb::Point7 => Effect::Earn.apply(ref game, 7),
            Orb::Point8 => Effect::Earn.apply(ref game, 8),
            Orb::Point9 => Effect::Earn.apply(ref game, 9),
            Orb::PointOrb1 => Effect::Earn.apply(ref game, game.pullable_orbs_count()),
            Orb::PointBomb4 => Effect::Earn.apply(ref game, game.pulled_bombs_count() * 4),
            Orb::Moonrock15 => Effect::Moonrock.apply(ref game, 15),
            Orb::Moonrock40 => Effect::Moonrock.apply(ref game, 40),
            Orb::Chips15 => Effect::Chips.apply(ref game, 15),
            Orb::CurseScoreDecrease => Effect::Lose.apply(ref game, LOSS_PERCENT),
            _ => 0,
        }
    }

    #[inline]
    fn cost(self: @Orb) -> u16 {
        match self {
            Orb::Health1 => 9,
            Orb::Health3 => 21,
            Orb::Multiplier50 => 9,
            Orb::Multiplier100 => 14,
            Orb::Multiplier150 => 16,
            Orb::Point5 => 5,
            Orb::Point7 => 8,
            Orb::Point8 => 11,
            Orb::Point9 => 13,
            Orb::PointBomb4 => 6,
            Orb::Moonrock15 => 8,
            Orb::Moonrock40 => 23,
            Orb::Chips15 => 5,
            _ => 0,
        }
    }

    #[inline]
    fn one_if_bomb(self: @Orb) -> u8 {
        match self {
            Orb::Bomb1 => 1,
            Orb::Bomb2 => 1,
            Orb::Bomb3 => 1,
            Orb::StickyBomb => 1,
            _ => 0,
        }
    }

    #[inline]
    fn one_if_special(self: @Orb) -> u8 {
        match self {
            Orb::Moonrock15 => 1,
            Orb::Moonrock40 => 1,
            Orb::Chips15 => 1,
            _ => 0,
        }
    }

    #[inline]
    fn one_if_multiplier(self: @Orb) -> u8 {
        match self {
            Orb::Multiplier50 => 1,
            Orb::Multiplier100 => 1,
            Orb::Multiplier150 => 1,
            _ => 0,
        }
    }

    #[inline]
    fn one_if_health(self: @Orb) -> u8 {
        match self {
            Orb::Health1 => 1,
            Orb::Health2 => 1,
            Orb::Health3 => 1,
            _ => 0,
        }
    }

    #[inline]
    fn one_if_point(self: @Orb) -> u8 {
        match self {
            Orb::Point5 => 1,
            Orb::Point6 => 1,
            Orb::Point7 => 1,
            Orb::Point8 => 1,
            Orb::Point9 => 1,
            Orb::PointOrb1 => 1,
            Orb::PointBomb4 => 1,
            _ => 0,
        }
    }
}

pub impl IntoOrbU8 of Into<Orb, u8> {
    #[inline]
    fn into(self: Orb) -> u8 {
        match self {
            Orb::Bomb1 => 1,
            Orb::Bomb2 => 2,
            Orb::Bomb3 => 3,
            Orb::Health1 => 4,
            Orb::Health2 => 5,
            Orb::Health3 => 6,
            Orb::Multiplier50 => 7,
            Orb::Multiplier100 => 8,
            Orb::Multiplier150 => 9,
            Orb::Point5 => 10,
            Orb::Point6 => 11,
            Orb::Point7 => 12,
            Orb::Point8 => 13,
            Orb::Point9 => 14,
            Orb::PointOrb1 => 15,
            Orb::PointBomb4 => 16,
            Orb::Moonrock15 => 17,
            Orb::Moonrock40 => 18,
            Orb::Chips15 => 19,
            Orb::CurseScoreDecrease => 20,
            Orb::StickyBomb => 21,
            _ => 0,
        }
    }
}

pub impl IntoU8Orb of Into<u8, Orb> {
    #[inline]
    fn into(self: u8) -> Orb {
        match self {
            1 => Orb::Bomb1,
            2 => Orb::Bomb2,
            3 => Orb::Bomb3,
            4 => Orb::Health1,
            5 => Orb::Health2,
            6 => Orb::Health3,
            7 => Orb::Multiplier50,
            8 => Orb::Multiplier100,
            9 => Orb::Multiplier150,
            10 => Orb::Point5,
            11 => Orb::Point6,
            12 => Orb::Point7,
            13 => Orb::Point8,
            14 => Orb::Point9,
            15 => Orb::PointOrb1,
            16 => Orb::PointBomb4,
            17 => Orb::Moonrock15,
            18 => Orb::Moonrock40,
            19 => Orb::Chips15,
            20 => Orb::CurseScoreDecrease,
            21 => Orb::StickyBomb,
            _ => Orb::None,
        }
    }
}

pub impl IntoOrbU128 of Into<Orb, u128> {
    #[inline]
    fn into(self: Orb) -> u128 {
        let value: u8 = self.into();
        value.into()
    }
}

pub impl TryIntoU128Orb of TryInto<u128, Orb> {
    #[inline]
    fn try_into(self: u128) -> Option<Orb> {
        match TryInto::<u128, u8>::try_into(self) {
            Option::Some(value) => Option::Some(value.into()),
            Option::None => Option::None,
        }
    }
}

pub impl IntoOrbU256 of Into<Orb, u256> {
    #[inline]
    fn into(self: Orb) -> u256 {
        let value: u8 = self.into();
        value.into()
    }
}

pub impl TryIntoU256Orb of TryInto<u256, Orb> {
    #[inline]
    fn try_into(self: u256) -> Option<Orb> {
        match TryInto::<u256, u8>::try_into(self) {
            Option::Some(value) => Option::Some(value.into()),
            Option::None => Option::None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{Orb, OrbTrait};

    // The `one_if_*` helpers classify each orb into a single quest-tracking
    // bucket. They are consumed by `playable.cairo::pull` to drive the
    // `*Puller` quest tasks (PowerUp, BombSquad, FirstAid, PointHunter,
    // Connoisseur, Mileage, Roadrunner). Any change here must be mirrored
    // in those quest definitions.

    fn all_orbs() -> Array<Orb> {
        array![
            Orb::Bomb1, Orb::Bomb2, Orb::Bomb3, Orb::StickyBomb, Orb::Health1, Orb::Health2,
            Orb::Health3, Orb::Multiplier50, Orb::Multiplier100, Orb::Multiplier150, Orb::Point5,
            Orb::Point6, Orb::Point7, Orb::Point8, Orb::Point9, Orb::PointOrb1, Orb::PointBomb4,
            Orb::Moonrock15, Orb::Moonrock40, Orb::Chips15, Orb::CurseScoreDecrease,
        ]
    }

    #[test]
    fn test_one_if_bomb_classifies_only_bombs() {
        // Bomb1/2/3 + StickyBomb are bombs; PointBomb4 is NOT a bomb (it's a
        // point orb whose value depends on bomb history).
        assert_eq!(Orb::Bomb1.one_if_bomb(), 1, "Bomb1 must be a bomb");
        assert_eq!(Orb::Bomb2.one_if_bomb(), 1, "Bomb2 must be a bomb");
        assert_eq!(Orb::Bomb3.one_if_bomb(), 1, "Bomb3 must be a bomb");
        assert_eq!(Orb::StickyBomb.one_if_bomb(), 1, "StickyBomb must be a bomb");
        assert_eq!(Orb::PointBomb4.one_if_bomb(), 0, "PointBomb4 is NOT a bomb");
        assert_eq!(Orb::Point5.one_if_bomb(), 0, "Point5 is not a bomb");
        assert_eq!(Orb::Health1.one_if_bomb(), 0, "Health1 is not a bomb");
        assert_eq!(Orb::Multiplier100.one_if_bomb(), 0, "Multiplier100 is not a bomb");
    }

    #[test]
    fn test_one_if_multiplier_classifies_only_multipliers() {
        assert_eq!(Orb::Multiplier50.one_if_multiplier(), 1, "Multiplier50 expected");
        assert_eq!(Orb::Multiplier100.one_if_multiplier(), 1, "Multiplier100 expected");
        assert_eq!(Orb::Multiplier150.one_if_multiplier(), 1, "Multiplier150 expected");
        assert_eq!(Orb::Bomb1.one_if_multiplier(), 0, "Bomb1 is not a multiplier");
        assert_eq!(Orb::Point5.one_if_multiplier(), 0, "Point5 is not a multiplier");
        assert_eq!(Orb::Health1.one_if_multiplier(), 0, "Health1 is not a multiplier");
    }

    #[test]
    fn test_one_if_health_classifies_only_health() {
        assert_eq!(Orb::Health1.one_if_health(), 1, "Health1 expected");
        assert_eq!(Orb::Health2.one_if_health(), 1, "Health2 expected");
        assert_eq!(Orb::Health3.one_if_health(), 1, "Health3 expected");
        assert_eq!(Orb::Bomb1.one_if_health(), 0, "Bomb1 is not health");
        assert_eq!(Orb::Multiplier100.one_if_health(), 0, "Multiplier100 is not health");
    }

    #[test]
    fn test_one_if_point_classifies_all_point_orbs() {
        // PointBomb4 and PointOrb1 are dynamic point orbs but still count.
        assert_eq!(Orb::Point5.one_if_point(), 1, "Point5 expected");
        assert_eq!(Orb::Point6.one_if_point(), 1, "Point6 expected");
        assert_eq!(Orb::Point7.one_if_point(), 1, "Point7 expected");
        assert_eq!(Orb::Point8.one_if_point(), 1, "Point8 expected");
        assert_eq!(Orb::Point9.one_if_point(), 1, "Point9 expected");
        assert_eq!(Orb::PointOrb1.one_if_point(), 1, "PointOrb1 expected");
        assert_eq!(Orb::PointBomb4.one_if_point(), 1, "PointBomb4 expected");
        assert_eq!(Orb::Bomb1.one_if_point(), 0, "Bomb1 is not a point orb");
        assert_eq!(Orb::Health1.one_if_point(), 0, "Health1 is not a point orb");
    }

    #[test]
    fn test_one_if_special_classifies_only_resource_orbs() {
        assert_eq!(Orb::Moonrock15.one_if_special(), 1, "Moonrock15 expected");
        assert_eq!(Orb::Moonrock40.one_if_special(), 1, "Moonrock40 expected");
        assert_eq!(Orb::Chips15.one_if_special(), 1, "Chips15 expected");
        assert_eq!(Orb::Bomb1.one_if_special(), 0, "Bomb1 is not special");
        assert_eq!(Orb::Point5.one_if_special(), 0, "Point5 is not special");
        assert_eq!(
            Orb::CurseScoreDecrease.one_if_special(), 0, "CurseScoreDecrease is not special",
        );
    }

    #[test]
    fn test_each_orb_has_at_most_one_classification() {
        // Quest progressions assume each orb maps to a single bucket so we
        // do not over-count (e.g. PowerUp must not progress from a Bomb1).
        // OrbPuller is the only counter that fires for every pulled orb.
        let orbs = all_orbs();
        let mut i: u32 = 0;
        while i < orbs.len() {
            let orb: Orb = *orbs.at(i);
            let total: u8 = orb.one_if_bomb()
                + orb.one_if_multiplier()
                + orb.one_if_health()
                + orb.one_if_point()
                + orb.one_if_special();
            assert!(total <= 1, "Orb at index {} matches multiple buckets (total={})", i, total);
            i += 1;
        }
    }
}
