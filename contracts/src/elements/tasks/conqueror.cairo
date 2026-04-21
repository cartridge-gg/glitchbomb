use crate::elements::tasks::interface::TaskTrait;

pub impl Conqueror of TaskTrait {
    fn identifier() -> felt252 {
        'CONQUEROR'
    }

    fn description(count: u32) -> ByteArray {
        match count {
            0 => "",
            1 => "Beat Level 7",
            _ => format!("Beat Level 7 {} times", count),
        }
    }
}

pub impl Flawless of TaskTrait {
    fn identifier() -> felt252 {
        'FLAWLESS'
    }

    fn description(count: u32) -> ByteArray {
        "Beat Level 7 with full health"
    }
}

pub impl LevelCritical of TaskTrait {
    fn identifier() -> felt252 {
        'LEVEL_CRITICAL'
    }

    fn description(count: u32) -> ByteArray {
        "Beat a level with 1 health"
    }
}

pub impl LevelFlawless of TaskTrait {
    fn identifier() -> felt252 {
        'LEVEL_FLAWLESS'
    }

    fn description(count: u32) -> ByteArray {
        "Beat a level with full health"
    }
}

pub impl NeverSurrender of TaskTrait {
    fn identifier() -> felt252 {
        'NEVER_SURRENDER'
    }

    fn description(count: u32) -> ByteArray {
        "Beat Level 7 with 1 health"
    }
}

pub impl WhatBombs of TaskTrait {
    fn identifier() -> felt252 {
        'WHAT_BOMBS'
    }

    fn description(count: u32) -> ByteArray {
        "Beat Level 7 without pulling a Bomb"
    }
}
