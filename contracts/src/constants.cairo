use core::num::traits::Pow;

pub const MAX_HEALTH: u8 = 5;
pub const MAX_CAPACITY: u32 = 50;

pub const DEFAULT_MOONROCKS: u16 = 100;
pub const DEFAULT_ENTRY_PRICE: u256 = 2_000_000;
pub const DEFAULT_LEVEL: u8 = 1;

pub const PRICE_MULTIPLIER: u256 = 100_000;
pub const STARTERPACK_COUNT: u8 = 10;

pub const GAME_EXPIRATION_TIME: u64 = 86400;

pub const MAX_SCORE: u16 = 524;

/// Scale factor applied to base_reward values (which are *100 for readability)
/// to produce raw token units for a 6-decimal token: 10^6 / 100 = 10_000.
pub const REWARD_SCALE: u256 = 10_000;

pub const WORLD_RESOURCE: felt252 = 0;
pub const TEN_POW_18: u128 = 10_u128.pow(18);
pub const TEN_POW_36: u128 = 10_u128.pow(36);
pub const MULTIPLIER_PRECISION: u128 = 1_000_000;

pub const VAULT_LOCKUP_DURATION: u64 = 0;

pub const EMA_MIN_TIME: u64 = 1; // 1 second
pub const EMA_MIN_SCORE: u8 = 5;
pub const EMA_SCORE_PRECISION: u32 = 1000;
pub const EMA_INITIAL_WEIGTH: u16 = 100;
pub const EMA_MAX_WEIGTH: u16 = 1000;

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
