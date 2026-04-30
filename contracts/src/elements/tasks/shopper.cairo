use crate::elements::tasks::interface::TaskTrait;

pub impl DiamondHands of TaskTrait {
    fn identifier() -> felt252 {
        'DIAMOND_HANDS'
    }

    fn description(count: u32) -> ByteArray {
        "Skip the shop for 2 levels in a row, then reach the next shop"
    }
}

pub impl ShopRich80 of TaskTrait {
    fn identifier() -> felt252 {
        'SHOP_RICH_80'
    }

    fn description(count: u32) -> ByteArray {
        "Enter a shop with 80 Bits"
    }
}

pub impl Shopper6 of TaskTrait {
    fn identifier() -> felt252 {
        'SHOPPER_6'
    }

    fn description(count: u32) -> ByteArray {
        "Buy 6 Orbs in a single shop"
    }
}

pub impl Shopper10 of TaskTrait {
    fn identifier() -> felt252 {
        'SHOPPER_10'
    }

    fn description(count: u32) -> ByteArray {
        "Buy 10 Orbs in a single shop"
    }
}

pub impl Shopper15 of TaskTrait {
    fn identifier() -> felt252 {
        'SHOPPER_15'
    }

    fn description(count: u32) -> ByteArray {
        "Buy 15 Orbs in a single shop"
    }
}

pub impl Specialist of TaskTrait {
    fn identifier() -> felt252 {
        'SPECIALIST'
    }

    fn description(count: u32) -> ByteArray {
        "Have 10 copies of the same Orb in your bag"
    }
}

pub impl Spender of TaskTrait {
    fn identifier() -> felt252 {
        'SPENDER'
    }

    fn description(count: u32) -> ByteArray {
        format!("Spend {} Bits", count)
    }
}
