use crate::elements::tasks::interface::TaskTrait;

pub impl Defused of TaskTrait {
    fn identifier() -> felt252 {
        'DEFUSED'
    }

    fn description(count: u32) -> ByteArray {
        "Pull when there are 0 Bombs remaining in the bag"
    }
}

pub impl Flatline of TaskTrait {
    fn identifier() -> felt252 {
        'FLATLINE'
    }

    fn description(count: u32) -> ByteArray {
        "Pull when there are 0 Points Orbs remaining in the bag"
    }
}

pub impl WhatNow of TaskTrait {
    fn identifier() -> felt252 {
        'WHAT_NOW'
    }

    fn description(count: u32) -> ByteArray {
        "Run out of orbs in your bag"
    }
}
