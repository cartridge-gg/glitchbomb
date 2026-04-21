use crate::elements::tasks::interface::TaskTrait;

pub impl Armageddon3 of TaskTrait {
    fn identifier() -> felt252 {
        'ARMAGEDDON_3'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 3 Triple Bombs in a single game"
    }
}

pub impl Armageddon4 of TaskTrait {
    fn identifier() -> felt252 {
        'ARMAGEDDON_4'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 4 Triple Bombs in a single game"
    }
}

pub impl BombStreak3 of TaskTrait {
    fn identifier() -> felt252 {
        'BOMB_STREAK_3'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 3 Bombs in a row"
    }
}

pub impl BombStreak4 of TaskTrait {
    fn identifier() -> felt252 {
        'BOMB_STREAK_4'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 4 Bombs in a row"
    }
}

pub impl BombStreak5 of TaskTrait {
    fn identifier() -> felt252 {
        'BOMB_STREAK_5'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 5 Bombs in a row"
    }
}

pub impl FullyTorqued of TaskTrait {
    fn identifier() -> felt252 {
        'FULLY_TORQUED'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 5 Multiplier Orbs in a row"
    }
}

pub impl GameBombs10 of TaskTrait {
    fn identifier() -> felt252 {
        'GAME_BOMBS_10'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 10 Bombs in a single game"
    }
}

pub impl GameBombs15 of TaskTrait {
    fn identifier() -> felt252 {
        'GAME_BOMBS_15'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 15 Bombs in a single game"
    }
}
