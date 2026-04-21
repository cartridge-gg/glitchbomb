use crate::elements::tasks::interface::TaskTrait;

pub impl Bottomless of TaskTrait {
    fn identifier() -> felt252 {
        'BOTTOMLESS'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 80 Orbs in a single game"
    }
}

pub impl Bottomless15 of TaskTrait {
    fn identifier() -> felt252 {
        'BOTTOMLESS_15'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 15 Orbs in a single game"
    }
}

pub impl Bottomless25 of TaskTrait {
    fn identifier() -> felt252 {
        'BOTTOMLESS_25'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 25 Orbs in a single game"
    }
}

pub impl Bottomless30 of TaskTrait {
    fn identifier() -> felt252 {
        'BOTTOMLESS_30'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 30 Orbs in a single game"
    }
}

pub impl Bottomless40 of TaskTrait {
    fn identifier() -> felt252 {
        'BOTTOMLESS_40'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 40 Orbs in a single game"
    }
}

pub impl LevelScorer35 of TaskTrait {
    fn identifier() -> felt252 {
        'LEVEL_SCORER_35'
    }

    fn description(count: u32) -> ByteArray {
        "Score 35 Points in a single level"
    }
}

pub impl LevelScorer45 of TaskTrait {
    fn identifier() -> felt252 {
        'LEVEL_SCORER_45'
    }

    fn description(count: u32) -> ByteArray {
        "Score 45 Points in a single level"
    }
}

pub impl LevelScorer60 of TaskTrait {
    fn identifier() -> felt252 {
        'LEVEL_SCORER_60'
    }

    fn description(count: u32) -> ByteArray {
        "Score 60 Points in a single level"
    }
}

pub impl QuickFinish3 of TaskTrait {
    fn identifier() -> felt252 {
        'QUICK_FINISH_3'
    }

    fn description(count: u32) -> ByteArray {
        "Beat a level in 3 or less pulls"
    }
}

pub impl QuickFinish4 of TaskTrait {
    fn identifier() -> felt252 {
        'QUICK_FINISH_4'
    }

    fn description(count: u32) -> ByteArray {
        "Beat a level in 4 or less pulls"
    }
}

pub impl Surge of TaskTrait {
    fn identifier() -> felt252 {
        'SURGE'
    }

    fn description(count: u32) -> ByteArray {
        "Score 70 Points in a single pull"
    }
}

pub impl Surge20 of TaskTrait {
    fn identifier() -> felt252 {
        'SURGE_20'
    }

    fn description(count: u32) -> ByteArray {
        "Score 20 Points in a single pull"
    }
}

pub impl Overload of TaskTrait {
    fn identifier() -> felt252 {
        'OVERLOAD'
    }

    fn description(count: u32) -> ByteArray {
        "Score 100 Points in a single pull"
    }
}
