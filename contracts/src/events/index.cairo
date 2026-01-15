// Dojo events for client synchronization

use crate::models::index::Game;
use crate::types::orb::Orb;

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct GameStarted {
    #[key]
    pub pack_id: u64,
    #[key]
    pub game_id: u8,
    pub level: u8,
    pub health: u8,
    pub milestone: u16,
}

#[generate_trait]
pub impl GameStartedImpl of GameStartedTrait {
    #[inline]
    fn new(game: @Game) -> GameStarted {
        GameStarted {
            pack_id: *game.pack_id,
            game_id: *game.id,
            level: *game.level,
            health: *game.health,
            milestone: *game.milestone,
        }
    }
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct OrbPulled {
    #[key]
    pub pack_id: u64,
    #[key]
    pub game_id: u8,
    #[key]
    pub id: u8,
    pub orb: u8,
    pub potential_moonrocks: u16, // Total points after this pull (what you'd cash out)
    pub delta: u16 // Points earned from this pull
}

#[generate_trait]
pub impl OrbPulledImpl of OrbPulledTrait {
    #[inline]
    fn new(id: u8, game: @Game, orb: @Orb, delta: u16) -> OrbPulled {
        OrbPulled {
            pack_id: *game.pack_id,
            game_id: *game.id,
            id: id,
            orb: (*orb).into(),
            potential_moonrocks: *game.points,
            delta: delta,
        }
    }
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct ShopEntered {
    #[key]
    pub pack_id: u64,
    #[key]
    pub game_id: u8,
    pub shop: u128,
    pub chips: u16,
}

#[generate_trait]
pub impl ShopEnteredImpl of ShopEnteredTrait {
    #[inline]
    fn new(game: @Game) -> ShopEntered {
        ShopEntered {
            pack_id: *game.pack_id, game_id: *game.id, shop: *game.shop, chips: *game.chips,
        }
    }
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct OrbPurchased {
    #[key]
    pub pack_id: u64,
    #[key]
    pub game_id: u8,
    pub orb_id: u8,
    pub cost: u16,
    pub chips: u16,
}

#[generate_trait]
pub impl OrbPurchasedImpl of OrbPurchasedTrait {
    #[inline]
    fn new(game: @Game, orb_id: u8, cost: u16) -> OrbPurchased {
        OrbPurchased {
            pack_id: *game.pack_id,
            game_id: *game.id,
            orb_id: orb_id,
            cost: cost,
            chips: *game.chips,
        }
    }
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct ShopRefreshed {
    #[key]
    pub pack_id: u64,
    #[key]
    pub game_id: u8,
    pub shop: u128,
    pub chips: u16,
}

#[generate_trait]
pub impl ShopRefreshedImpl of ShopRefreshedTrait {
    #[inline]
    fn new(game: @Game) -> ShopRefreshed {
        ShopRefreshed {
            pack_id: *game.pack_id, game_id: *game.id, shop: *game.shop, chips: *game.chips,
        }
    }
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct OrbBurned {
    #[key]
    pub pack_id: u64,
    #[key]
    pub game_id: u8,
    pub orb_id: u8,
    pub bag_index: u8,
    pub chips: u16,
}

#[generate_trait]
pub impl OrbBurnedImpl of OrbBurnedTrait {
    #[inline]
    fn new(game: @Game, orb_id: u8, bag_index: u8) -> OrbBurned {
        OrbBurned {
            pack_id: *game.pack_id,
            game_id: *game.id,
            orb_id: orb_id,
            bag_index: bag_index,
            chips: *game.chips,
        }
    }
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct ShopExited {
    #[key]
    pub pack_id: u64,
    #[key]
    pub game_id: u8,
    pub level: u8,
    pub health: u8,
    pub milestone: u16,
    pub cost: u16,
}

#[generate_trait]
pub impl ShopExitedImpl of ShopExitedTrait {
    #[inline]
    fn new(game: @Game, cost: u16) -> ShopExited {
        ShopExited {
            pack_id: *game.pack_id,
            game_id: *game.id,
            level: *game.level,
            health: *game.health,
            milestone: *game.milestone,
            cost: cost,
        }
    }
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct GameOver {
    #[key]
    pub pack_id: u64,
    #[key]
    pub game_id: u8,
    pub reason: u8, // 0 = death, 1 = cash_out
    pub points: u16,
}

#[generate_trait]
pub impl GameOverImpl of GameOverTrait {
    #[inline]
    fn new(game: @Game, reason: u8) -> GameOver {
        GameOver { pack_id: *game.pack_id, game_id: *game.id, reason: reason, points: *game.points }
    }
}
