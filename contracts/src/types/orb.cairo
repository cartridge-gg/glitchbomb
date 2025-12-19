use crate::models::game::{Game, GameTrait};
use crate::types::effect::{Effect, EffectTrait};

#[derive(Drop, Copy, PartialEq)]
pub enum Orb {
    None,
    Bomb1,
    Bomb2,
    Bomb3,
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
}

#[generate_trait]
pub impl OrbImpl of OrbTrait {
    #[inline]
    fn apply(self: @Orb, ref game: Game) -> u16 {
        match self {
            Orb::Bomb1 => Effect::Explode.apply(ref game, 1),
            Orb::Bomb2 => Effect::Explode.apply(ref game, 2),
            Orb::Bomb3 => Effect::Explode.apply(ref game, 3),
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
