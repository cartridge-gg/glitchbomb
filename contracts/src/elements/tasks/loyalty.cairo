use crate::elements::tasks::interface::TaskTrait;

pub impl Loyalty of TaskTrait {
    fn identifier() -> felt252 {
        'LOYALTY'
    }

    fn description(count: u32) -> ByteArray {
        match count {
            0 => "",
            1 => "Play 1 game",
            _ => format!("Play {} games", count),
        }
    }
}
