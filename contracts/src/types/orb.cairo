use crate::models::game::{Game, GameTrait};
use crate::types::effect::{Effect, EffectTrait};

#[derive(Drop, Copy)]
pub enum Orb {
    None,
    Bomb1,
    Bomb2,
    Bomb3,
    Health1,
    Health3,
    Multiplier50,
    Multiplier100,
    Multiplier150,
    Point5,
    Point7,
    Point8,
    Point9,
    PointOrb1,
    PointBomb4,
    Moonrock15,
    Moonrock40,
    Cheddah15,
}

#[generate_trait]
pub impl OrbImpl of OrbTrait {
    #[inline]
    fn apply(self: @Orb, ref game: Game) {
        match self {
            Orb::Bomb1 => Effect::Explode.apply(ref game, 1),
            Orb::Bomb2 => Effect::Explode.apply(ref game, 2),
            Orb::Bomb3 => Effect::Explode.apply(ref game, 3),
            Orb::Health1 => Effect::Heal.apply(ref game, 1),
            Orb::Health3 => Effect::Heal.apply(ref game, 3),
            Orb::Multiplier50 => Effect::Boost.apply(ref game, 50),
            Orb::Multiplier100 => Effect::Boost.apply(ref game, 100),
            Orb::Multiplier150 => Effect::Boost.apply(ref game, 150),
            Orb::Point5 => Effect::Earn.apply(ref game, 5),
            Orb::Point7 => Effect::Earn.apply(ref game, 7),
            Orb::Point8 => Effect::Earn.apply(ref game, 8),
            Orb::Point9 => Effect::Earn.apply(ref game, 9),
            Orb::PointOrb1 => Effect::Earn.apply(ref game, game.pullable_orbs_count()),
            Orb::PointBomb4 => Effect::Earn.apply(ref game, game.pulled_bombs_count() * 4),
            Orb::Moonrock15 => Effect::Moonrock.apply(ref game, 15),
            Orb::Moonrock40 => Effect::Moonrock.apply(ref game, 40),
            Orb::Cheddah15 => Effect::Cheddah.apply(ref game, 15),
            _ => {},
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
            Orb::Cheddah15 => 5,
            _ => 0,
        }
    }
}
