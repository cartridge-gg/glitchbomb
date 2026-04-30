use crate::elements::tasks::interface::TaskTrait;

pub impl CashOut125 of TaskTrait {
    fn identifier() -> felt252 {
        'CASH_OUT_125'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 125 Moon Rocks"
    }
}

pub impl CashOut135 of TaskTrait {
    fn identifier() -> felt252 {
        'CASH_OUT_135'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 135 Moon Rocks"
    }
}

pub impl CashOut150 of TaskTrait {
    fn identifier() -> felt252 {
        'CASH_OUT_150'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 150 Moon Rocks"
    }
}

pub impl CashOut160 of TaskTrait {
    fn identifier() -> felt252 {
        'CASH_OUT_160'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 160 Moon Rocks"
    }
}

pub impl CashOut180 of TaskTrait {
    fn identifier() -> felt252 {
        'CASH_OUT_180'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 180 Moon Rocks"
    }
}

pub impl CashOut200 of TaskTrait {
    fn identifier() -> felt252 {
        'CASH_OUT_200'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 200 Moon Rocks"
    }
}

pub impl CashOut300 of TaskTrait {
    fn identifier() -> felt252 {
        'CASH_OUT_300'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 300 Moon Rocks"
    }
}
pub impl CashOut400 of TaskTrait {
    fn identifier() -> felt252 {
        'CASH_OUT_400'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 400 Moon Rocks"
    }
}

pub impl CashOut500 of TaskTrait {
    fn identifier() -> felt252 {
        'CASH_OUT_500'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 500 Moon Rocks"
    }
}

pub impl CashOut600 of TaskTrait {
    fn identifier() -> felt252 {
        'CASH_OUT_600'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 600 Moon Rocks"
    }
}

pub impl CashOut700 of TaskTrait {
    fn identifier() -> felt252 {
        'CASH_OUT_700'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 700 Moon Rocks"
    }
}

pub impl Harvest of TaskTrait {
    fn identifier() -> felt252 {
        'HARVEST'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 200 Moon Rocks from Orbs in a single level"
    }
}

pub impl Harvest5 of TaskTrait {
    fn identifier() -> felt252 {
        'HARVEST_5'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 5 Moon Rocks from Orbs in a single level"
    }
}

pub impl Harvest40 of TaskTrait {
    fn identifier() -> felt252 {
        'HARVEST_40'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 40 Moon Rocks from Orbs in a single level"
    }
}

pub impl Harvest80 of TaskTrait {
    fn identifier() -> felt252 {
        'HARVEST_80'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 80 Moon Rocks from Orbs in a single level"
    }
}

pub impl Jackpot of TaskTrait {
    fn identifier() -> felt252 {
        'JACKPOT'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 320 Moon Rocks from Orbs in a single level"
    }
}

pub impl Survivor1 of TaskTrait {
    fn identifier() -> felt252 {
        'SURVIVOR_1'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 1 health"
    }
}

pub impl Survivor2 of TaskTrait {
    fn identifier() -> felt252 {
        'SURVIVOR_2'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 2 or less health"
    }
}

pub impl Lunarian of TaskTrait {
    fn identifier() -> felt252 {
        'LUNARIAN'
    }

    fn description(count: u32) -> ByteArray {
        match count {
            0 => "",
            1 => "Cash out with 200 Moon Rocks",
            _ => format!("Cash out with 200 Moon Rocks {} times", count),
        }
    }
}

pub impl Moonshot of TaskTrait {
    fn identifier() -> felt252 {
        'MOONSHOT'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 300 Moon Rocks"
    }
}

pub impl LunarEclipse of TaskTrait {
    fn identifier() -> felt252 {
        'LUNAR_ECLIPSE'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 500 Moon Rocks"
    }
}

pub impl Supernova of TaskTrait {
    fn identifier() -> felt252 {
        'SUPERNOVA'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 600 Moon Rocks"
    }
}

pub impl InfiniteGlitch of TaskTrait {
    fn identifier() -> felt252 {
        'INFINITE_GLITCH'
    }

    fn description(count: u32) -> ByteArray {
        "Cash out with 700 Moon Rocks"
    }
}
