pub const CONFIG_ID: felt252 = 0;

pub const MAX_HEALTH: u8 = 5;
pub const MAX_CAPACITY: u32 = 50;

pub const DEFAULT_MOONROCKS: u16 = 100;
pub const DEFAULT_ENTRY_PRICE: u256 = 2_000_000;
pub const DEFAULT_GAMES_COUNT: u8 = 5;
pub const DEFAULT_LEVEL: u8 = 1;

pub const BASE_COST_DOLLARS: u16 = 2;
pub const NUM_TIERS: u32 = 8;

pub fn COST_TIER_PRICES() -> [u256; 8] {
    [
        2_000_000,   // $2
        5_000_000,   // $5
        10_000_000,  // $10
        25_000_000,  // $25
        50_000_000,  // $50
        100_000_000, // $100
        250_000_000, // $250
        500_000_000, // $500
    ]
}

#[inline]
pub fn NAMESPACE() -> ByteArray {
    "GLITCHBOMB"
}

#[inline]
pub fn NAME() -> ByteArray {
    "Glitch Bomb"
}

#[inline]
pub fn SYMBOL() -> ByteArray {
    "GLITCHBOMB"
}

#[inline]
pub fn DESCRIPTION() -> ByteArray {
    "Glitch Bomb is a cosmic-themed push-your-luck rogue-like bag-building game where players draw orbs from a bag to score points while avoiding bombs. What makes this game compelling is its brilliant tension between greed and survival, where every tap of the moon bag could yield valuable points or deal devastating damage, ending a nail-biting, breath taking, one of a lifetime run. Will you risk it for moon rocks, or will you just kick rocks?"
}

#[inline]
pub fn DEVELOPER() -> ByteArray {
    "Cartridge"
}

#[inline]
pub fn PUBLISHER() -> ByteArray {
    "Cartridge"
}

#[inline]
pub fn GENRE() -> ByteArray {
    "Push-Your-Luck"
}

#[inline]
pub fn IMAGE() -> ByteArray {
    "https://static.cartridge.gg/presets/glitch-bomb/icon.png"
}

#[inline]
pub fn BANNER() -> ByteArray {
    "https://static.cartridge.gg/presets/glitch-bomb/cover.png"
}

#[inline]
pub fn CLIENT_URL() -> ByteArray {
    "https://glitchbomb.gg"
}
