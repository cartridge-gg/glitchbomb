use crate::elements::tasks::interface::TaskTrait;

pub impl BagCopies4 of TaskTrait {
    fn identifier() -> felt252 {
        'BAG_COPIES_4'
    }

    fn description(count: u32) -> ByteArray {
        "Have 4 copies of the same Orb in your bag"
    }
}

pub impl BagCopies5 of TaskTrait {
    fn identifier() -> felt252 {
        'BAG_COPIES_5'
    }

    fn description(count: u32) -> ByteArray {
        "Have 5 copies of the same Orb in your bag"
    }
}

pub impl BagCopies6 of TaskTrait {
    fn identifier() -> felt252 {
        'BAG_COPIES_6'
    }

    fn description(count: u32) -> ByteArray {
        "Have 6 copies of the same Orb in your bag"
    }
}

pub impl BagSize20 of TaskTrait {
    fn identifier() -> felt252 {
        'BAG_SIZE_20'
    }

    fn description(count: u32) -> ByteArray {
        "Have 20 Orbs in your bag"
    }
}

pub impl BagSize25 of TaskTrait {
    fn identifier() -> felt252 {
        'BAG_SIZE_25'
    }

    fn description(count: u32) -> ByteArray {
        "Have 25 Orbs in your bag"
    }
}
