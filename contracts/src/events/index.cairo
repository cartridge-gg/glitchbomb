// Dojo events for client synchronization

use crate::models::index::Game;
use crate::types::orb::Orb;

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Purchased {
    #[key]
    pub player_id: felt252,
    pub starterpack_id: u32,
    pub quantity: u32,
    pub multiplier: u128,
    pub time: u64,
    pub price: u256,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Started {
    #[key]
    pub player_id: felt252,
    #[key]
    pub game_id: u64,
    pub multiplier: u128,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct Claimed {
    #[key]
    pub player_id: felt252,
    #[key]
    pub game_id: u64,
    pub reward: u128,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct VaultPaid {
    #[key]
    pub player_id: felt252,
    pub amount: u256,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct VaultClaimed {
    #[key]
    pub user: felt252,
    pub amount: u256,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct GameStarted {
    #[key]
    pub game_id: u64,
    pub level: u8,
    pub health: u8,
    pub milestone: u16,
}

#[generate_trait]
pub impl GameStartedImpl of GameStartedTrait {
    #[inline]
    fn new(game: @Game) -> GameStarted {
        GameStarted {
            game_id: *game.id, level: *game.level, health: *game.health, milestone: *game.milestone,
        }
    }
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct OrbPulled {
    #[key]
    pub game_id: u64,
    #[key]
    pub id: u8,
    pub orb: u8,
    pub potential_moonrocks: u16 // game.moonrocks + game.points (what you'd have if you cash out)
}

#[generate_trait]
pub impl OrbPulledImpl of OrbPulledTrait {
    #[inline]
    fn new(id: u8, game: @Game, orb: @Orb) -> OrbPulled {
        OrbPulled {
            game_id: *game.id,
            id: id,
            orb: (*orb).into(),
            potential_moonrocks: *game.moonrocks + *game.points,
        }
    }
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct PLDataPoint {
    #[key]
    pub game_id: u64,
    #[key]
    pub id: u32, // Sequential ID for ordering
    pub potential_moonrocks: u16,
    pub orb: u8 // 0 for non-orb events (level cost), orb type otherwise
}

#[generate_trait]
pub impl PLDataPointImpl of PLDataPointTrait {
    #[inline]
    fn new(id: u32, game: @Game, potential_moonrocks: u16, orb: u8) -> PLDataPoint {
        PLDataPoint { game_id: *game.id, id, potential_moonrocks, orb }
    }
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct GameOver {
    #[key]
    pub game_id: u64,
    pub reason: u8, // 0 = death, 1 = cash_out
    pub points: u16,
}

#[generate_trait]
pub impl GameOverImpl of GameOverTrait {
    #[inline]
    fn new(game: @Game, reason: u8) -> GameOver {
        GameOver { game_id: *game.id, reason: reason, points: *game.points }
    }
}
