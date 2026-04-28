use starknet::ContractAddress;

#[derive(Drop, Serde)]
#[dojo::model]
pub struct Config {
    #[key]
    pub world_resource: felt252,
    pub vrf: ContractAddress,
    pub quote: ContractAddress,
    pub team_address: ContractAddress,
    pub ekubo_router: ContractAddress,
    pub ekubo_positions: ContractAddress,
    pub target_supply: u256,
    pub burn_percentage: u8,
    pub vault_percentage: u8,
    pub average_weigth: u16,
    pub average_score: u32,
    pub last_updated: u64,
    pub pool_fee: u128,
    pub pool_tick_spacing: u128,
    pub pool_extension: ContractAddress,
    pub pool_sqrt: u256,
    pub base_price: u256,
}

#[derive(Drop, Serde)]
#[dojo::model]
pub struct Game {
    #[key]
    pub id: u64,
    pub claimed: bool,
    pub level: u8,
    pub health: u8,
    pub immunity: u8,
    pub curses: u8, // Bitmap: Each bit represents an active curse (DoubleDraw=bit0, etc.)
    pub pull_count: u8,
    pub points: u16,
    pub milestone: u16,
    pub multiplier: u16,
    pub chips: u16,
    pub moonrocks: u16,
    pub over: u64,
    pub expiration: u64,
    pub discards: u64, // Bitmap: Each bit represents a pulled orb index (0-49)
    pub shop: u128, // Packed: orbs (30 bits) | refresh_used (1) | burn_used (1) | purchase_counts (60 bits, persist across shops)
    pub stake: u128,
    pub level_counters: u128,
    pub counters: u128,
    pub bag: felt252, // Packed: Each orb is 5 bits, indicating its variant from the Orb enum.
    pub supply: felt252,
    pub price: felt252,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct VaultInfo {
    #[key]
    pub world_resource: felt252,
    pub open: bool,
    pub total_reward: u256,
    pub fee: u16,
}

#[derive(Copy, Drop, Serde)]
#[dojo::model]
pub struct VaultPosition {
    #[key]
    pub user: felt252,
    pub time_lock: u64,
    pub current_reward: u256,
    pub pending_reward: u256,
}

