use crate::elements::tasks::interface::TaskTrait;

pub impl Linear of TaskTrait {
    fn identifier() -> felt252 {
        'LINEAR'
    }

    fn description(count: u32) -> ByteArray {
        "Start a level with a bag containing 80% Points Orbs"
    }
}

pub impl Exponential of TaskTrait {
    fn identifier() -> felt252 {
        'EXPONENTIAL'
    }

    fn description(count: u32) -> ByteArray {
        "Start a level with a bag containing 50% Multiplier Orbs"
    }
}

pub impl Metagamer of TaskTrait {
    fn identifier() -> felt252 {
        'METAGAMER'
    }

    fn description(count: u32) -> ByteArray {
        "Start a level with a bag containing 40% Special Orbs"
    }
}

pub impl Medic of TaskTrait {
    fn identifier() -> felt252 {
        'MEDIC'
    }

    fn description(count: u32) -> ByteArray {
        "Start a level with a bag containing 25% Health Orbs"
    }
}

pub impl Immortal of TaskTrait {
    fn identifier() -> felt252 {
        'IMMORTAL'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 12 Health in a single level"
    }
}

pub impl Immortal5 of TaskTrait {
    fn identifier() -> felt252 {
        'IMMORTAL_5'
    }

    fn description(count: u32) -> ByteArray {
        "Pull 5 Health in a single level"
    }
}
