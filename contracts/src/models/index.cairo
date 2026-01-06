use starknet::ContractAddress;

#[derive(Drop, Serde)]
#[dojo::model]
pub struct Config {
    #[key]
    pub id: felt252,
    pub vrf: ContractAddress,
    pub token: ContractAddress,
    pub registry: ContractAddress,
    pub owner: ContractAddress,
    pub fee_receiver: ContractAddress,
    pub entry_price: felt252,
}

#[derive(Drop, Serde, IntrospectPacked)]
#[dojo::model]
pub struct Starterpack {
    #[key]
    pub id: u32,
    pub reissuable: bool,
    pub referral_percentage: u8,
    pub price: u256,
    pub payment_token: ContractAddress,
}

#[derive(Drop, Serde, Debug, IntrospectPacked)]
#[dojo::model]
pub struct Pack {
    #[key]
    pub id: u64,
    pub game_count: u8,
    pub moonrocks: u16,
}

#[derive(Drop, Serde, IntrospectPacked)]
#[dojo::model]
pub struct Game {
    #[key]
    pub pack_id: u64,
    #[key]
    pub id: u8,
    pub seed: felt252, // Current VRF seed for random effects
    pub over: bool,
    pub level: u8,
    pub health: u8,
    pub immunity: u8,
    pub curses: u8, // Bitmap: Each bit represents an active curse (DoubleDraw=bit0, etc.)
    pub pull_count: u8,
    pub points: u16,
    pub milestone: u16,
    pub multiplier: u16,
    pub chips: u16,
    pub discards: u64, // Bitmap: Each bit represents a pulled orb index (0-49)
    pub bag: felt252, // Packed: Each orb is 5 bits, indicating its variant from the Orb enum.
    pub shop: u128 // Packed: orbs (30 bits) | refresh_used (1) | burn_used (1) | purchase_counts (60 bits)
}
