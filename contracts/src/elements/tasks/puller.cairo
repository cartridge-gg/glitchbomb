use crate::elements::tasks::interface::TaskTrait;

pub impl BombPuller of TaskTrait {
    fn identifier() -> felt252 {
        'BOMB_PULLER'
    }

    fn description(count: u32) -> ByteArray {
        format!("Pull {} Bombs", count)
    }
}

pub impl HealthPuller of TaskTrait {
    fn identifier() -> felt252 {
        'HEALTH_PULLER'
    }

    fn description(count: u32) -> ByteArray {
        format!("Pull {} Health Orbs", count)
    }
}

pub impl MultiplierPuller of TaskTrait {
    fn identifier() -> felt252 {
        'MULTIPLIER_PULLER'
    }

    fn description(count: u32) -> ByteArray {
        format!("Pull {} Multiplier Orbs", count)
    }
}

pub impl OrbPuller of TaskTrait {
    fn identifier() -> felt252 {
        'ORB_PULLER'
    }

    fn description(count: u32) -> ByteArray {
        format!("Pull {} Orbs", count)
    }
}

pub impl PointsPuller of TaskTrait {
    fn identifier() -> felt252 {
        'POINTS_PULLER'
    }

    fn description(count: u32) -> ByteArray {
        format!("Pull {} Points Orbs", count)
    }
}

pub impl SpecialPuller of TaskTrait {
    fn identifier() -> felt252 {
        'SPECIAL_PULLER'
    }

    fn description(count: u32) -> ByteArray {
        format!("Pull {} Special Orbs", count)
    }
}
