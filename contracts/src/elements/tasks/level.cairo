use crate::elements::tasks::interface::TaskTrait;

pub impl LevelReacher2 of TaskTrait {
    fn identifier() -> felt252 {
        'LEVEL_REACHER_2'
    }

    fn description(count: u32) -> ByteArray {
        "Reach Level 2"
    }
}

pub impl LevelReacher3 of TaskTrait {
    fn identifier() -> felt252 {
        'LEVEL_REACHER_3'
    }

    fn description(count: u32) -> ByteArray {
        "Reach Level 3"
    }
}

pub impl LevelReacher4 of TaskTrait {
    fn identifier() -> felt252 {
        'LEVEL_REACHER_4'
    }

    fn description(count: u32) -> ByteArray {
        "Reach Level 4"
    }
}

pub impl LevelReacher5 of TaskTrait {
    fn identifier() -> felt252 {
        'LEVEL_REACHER_5'
    }

    fn description(count: u32) -> ByteArray {
        "Reach Level 5"
    }
}

pub impl LevelReacher6 of TaskTrait {
    fn identifier() -> felt252 {
        'LEVEL_REACHER_6'
    }

    fn description(count: u32) -> ByteArray {
        "Reach Level 6"
    }
}
