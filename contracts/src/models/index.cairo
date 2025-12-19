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
    pub shop: u32,
    pub discards: u64,
    pub bag: felt252 // Up to 50 * u5
}
