use crate::elements::tasks::interface::TaskTrait;

pub impl Climber3 of TaskTrait {
    fn identifier() -> felt252 {
        'CLIMBER_3'
    }

    fn description(count: u32) -> ByteArray {
        "Reach a x3 multiplier"
    }
}

pub impl Climber4 of TaskTrait {
    fn identifier() -> felt252 {
        'CLIMBER_4'
    }

    fn description(count: u32) -> ByteArray {
        "Reach a x4 multiplier"
    }
}

pub impl Climber5 of TaskTrait {
    fn identifier() -> felt252 {
        'CLIMBER_5'
    }

    fn description(count: u32) -> ByteArray {
        "Reach a x5 multiplier"
    }
}

pub impl SkyHigh of TaskTrait {
    fn identifier() -> felt252 {
        'SKY_HIGH'
    }

    fn description(count: u32) -> ByteArray {
        "Reach a x7 multiplier"
    }
}

pub impl ToTheMoon of TaskTrait {
    fn identifier() -> felt252 {
        'TO_THE_MOON'
    }

    fn description(count: u32) -> ByteArray {
        "Reach a x10 multiplier"
    }
}
