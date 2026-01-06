// Dojo events for client synchronization

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
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct MilestoneReached {
    #[key]
    pub pack_id: u64,
    #[key]
    pub game_id: u8,
    pub level: u8,
    pub milestone: u16,
    pub points: u16,
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

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct OrbPurchased {
    #[key]
    pub pack_id: u64,
    #[key]
    pub game_id: u8,
    pub orb_id: u8,
    pub cost: u16,
    pub chips_remaining: u16,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct ShopRefreshed {
    #[key]
    pub pack_id: u64,
    #[key]
    pub game_id: u8,
    pub shop: u128,
    pub chips_remaining: u16,
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
    pub chips_remaining: u16,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct ShopExited {
    #[key]
    pub pack_id: u64,
    #[key]
    pub game_id: u8,
    pub next_level: u8,
    pub entry_cost: u16,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct LevelStarted {
    #[key]
    pub pack_id: u64,
    #[key]
    pub game_id: u8,
    pub level: u8,
    pub health: u8,
    pub milestone: u16,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct GameOver {
    #[key]
    pub pack_id: u64,
    #[key]
    pub game_id: u8,
    pub reason: u8, // 0 = death, 1 = cash_out
    pub final_points: u16,
}
