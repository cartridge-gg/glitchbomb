#[generate_trait]
pub impl Milestone of MilestoneTrait {
    #[inline]
    fn get(level: u8) -> u16 {
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
        let x: u16 = level.into();
        x * (2 * x + 1) / 8
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_milestone_get() {
        assert_eq!(Milestone::get(1), 12);
        assert_eq!(Milestone::get(2), 18);
        assert_eq!(Milestone::get(3), 28);
        assert_eq!(Milestone::get(4), 44);
        assert_eq!(Milestone::get(5), 70);
        assert_eq!(Milestone::get(6), 100);
        assert_eq!(Milestone::get(7), 150);
    }

    #[test]
    fn test_milestone_cost() {
        assert_eq!(Milestone::cost(0), 0);
        assert_eq!(Milestone::cost(1), 0);
        assert_eq!(Milestone::cost(2), 1);
        assert_eq!(Milestone::cost(3), 2);
        assert_eq!(Milestone::cost(4), 4);
        assert_eq!(Milestone::cost(5), 6);
        assert_eq!(Milestone::cost(6), 9);
        assert_eq!(Milestone::cost(7), 13);
    }
}
