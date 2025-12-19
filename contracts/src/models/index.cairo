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
    pub over: bool,
    pub level: u8,
    pub health: u8,
    pub immunity: u8,
    pub points: u16,
    pub milestone: u16,
    pub multiplier: u16,
    pub chips: u16,
    pub discards: u64, // Bitmap: Each bit represents a pulled orb index (0-49)
    pub bag: felt252, // Packed: Each orb is 5 bits, indicating its variant from the Orb enum.
    pub shop: u128 // Packed: orbs (30 bits) | refresh_used (1) | burn_used (1) | purchase_counts (60 bits)
}
