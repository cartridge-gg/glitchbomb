#[generate_trait]
pub impl Milestone of MilestoneTrait {
    #[inline]
    fn get(level: u8) -> u16 {
        // let x: u16 = level.into();
        // x * x * x + 10 * x
        match level {
            1 => 12,
            2 => 18,
            3 => 28,
            4 => 44,
            5 => 70,
            6 => 100,
            7 => 150,
            _ => 0,
        }
    }

    #[inline]
    fn cost(level: u8) -> u16 {
        // let x: u16 = level.into();
        // x * x / 4
        match level {
            1 => 10,
            2 => 1,
            3 => 2,
            4 => 4,
            5 => 6,
            6 => 9,
            7 => 13,
            _ => 0,
        }
    }
}
