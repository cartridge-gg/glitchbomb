use crate::constants::{MULTIPLIER_PRECISION, TEN_POW_18};

const BASE_MULTIPLIER: u128 = 100;

#[generate_trait]
pub impl Rewarder of RewarderTrait {
    /// Calculate the base reward for a given score..
    fn base(score: u16) -> u256 {
        let base: u128 = if score >= 524 {
            1000
        } else if score >= 428 {
            720
        } else if score >= 356 {
            530
        } else if score >= 300 {
            395
        } else if score >= 256 {
            300
        } else if score >= 222 {
            230
        } else if score >= 196 {
            182
        } else if score >= 176 {
            147
        } else if score >= 160 {
            121
        } else if score >= 148 {
            100
        } else if score >= 138 {
            88
        } else if score >= 130 {
            77
        } else if score >= 124 {
            69
        } else if score >= 118 {
            61
        } else if score >= 112 {
            54
        } else if score >= 106 {
            46
        } else if score >= 100 {
            40
        } else if score >= 94 {
            34
        } else if score >= 88 {
            25
        } else if score >= 78 {
            13
        } else if score >= 65 {
            1
        } else {
            0
        };
        (base * TEN_POW_18 / BASE_MULTIPLIER).into()
    }

    /// Calculate the supply multiplier for a given supply and target.
    /// # Arguments
    /// * `supply` - The current supply of the game.
    /// * `target` - The target supply of the game.
    /// # Returns
    /// The supply multiplier on a 100-based scale.
    #[inline]
    fn supply_multiplier(supply: u256, target: u256) -> u128 {
        if supply > target * 2 || target == 0 {
            return 0;
        }
        ((2 * target - supply) * MULTIPLIER_PRECISION.into() / target).try_into().unwrap()
    }

    /// Calculate the burn multiplier for a given burn amount and score.
    /// # Arguments
    /// * `burn` - The burn amount.
    /// * `score` - The score.
    /// # Returns
    /// The burn multiplier on a 100-based scale.
    #[inline]
    fn burn_multiplier(burn: u256, score: u16) -> u128 {
        let mint = Self::base(score);
        if mint == 0 {
            return 0;
        }
        (burn * MULTIPLIER_PRECISION.into() / mint).try_into().unwrap()
    }

    /// Calculate the multiplier for a given supply, target, burn, score, and slot count.
    /// # Arguments
    /// * `supply` - The current supply of the game.
    /// * `target` - The target supply of the game.
    /// * `burn` - The burn amount.
    /// * `score` - The score.
    /// # Returns
    /// The multiplier on a 100-based scale.
    #[inline]
    fn multiplier(supply: u256, target: u256, burn: u256, score: u16) -> u128 {
        let supply_multiplier: u128 = Self::supply_multiplier(supply, target);
        let burn_multiplier: u128 = Self::burn_multiplier(burn, score);
        let multiplier: u128 = supply_multiplier * burn_multiplier / MULTIPLIER_PRECISION;
        multiplier
    }

    /// Calculate the reward amount for a given score and multiplier.
    /// # Arguments
    /// * `score` - The score.
    /// * `multiplier` - The multiplier for the reward.
    /// # Returns
    /// The reward amount.
    #[inline]
    fn amount(score: u16, multiplier: u128) -> u256 {
        let base = Self::base(score);
        let amount = base * multiplier.into() / MULTIPLIER_PRECISION.into();
        amount
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const BURN: u256 = 1 * TEN_POW_18.into();
    const TARGET_SUPPLY: u256 = 1_000_000;
    const AVG_SCORE: u16 = 148;

    #[test]
    fn test_rewarder_at_target_at_average() {
        let multiplier = Rewarder::multiplier(TARGET_SUPPLY, TARGET_SUPPLY, BURN, AVG_SCORE);
        let reward = Rewarder::amount(AVG_SCORE, multiplier);
        let err = (BURN - reward) * MULTIPLIER_PRECISION.into() / BURN;
        assert_le!(err, MULTIPLIER_PRECISION.into());
    }

    #[test]
    fn test_rewarder_at_target_below_average() {
        let multiplier = Rewarder::multiplier(TARGET_SUPPLY, TARGET_SUPPLY, BURN, AVG_SCORE);
        let reward = Rewarder::amount(100, multiplier);
        assert_lt!(reward, BURN);
    }

    #[test]
    fn test_rewarder_at_target_above_average() {
        let multiplier = Rewarder::multiplier(TARGET_SUPPLY, TARGET_SUPPLY, BURN, AVG_SCORE);
        let reward = Rewarder::amount(200, multiplier);
        assert_gt!(reward, BURN);
    }

    #[test]
    fn test_rewarder_below_target_at_average() {
        let multiplier = Rewarder::multiplier(TARGET_SUPPLY / 2, TARGET_SUPPLY, BURN, AVG_SCORE);
        let reward = Rewarder::amount(AVG_SCORE, multiplier);
        assert_gt!(reward, BURN);
    }

    #[test]
    fn test_rewarder_above_target_at_average() {
        let multiplier = Rewarder::multiplier(
            TARGET_SUPPLY * 3 / 2, TARGET_SUPPLY, BURN, AVG_SCORE,
        );
        let reward = Rewarder::amount(AVG_SCORE, multiplier);
        assert_lt!(reward, BURN);
    }

    #[test]
    fn test_rewarder_at_target_at_lowest() {
        let multiplier = Rewarder::multiplier(TARGET_SUPPLY, TARGET_SUPPLY, BURN, AVG_SCORE);
        let reward = Rewarder::amount(0, multiplier);
        assert_eq!(reward, 0);
    }

    #[test]
    fn test_rewarder_at_target_at_highest() {
        let multiplier = Rewarder::multiplier(TARGET_SUPPLY, TARGET_SUPPLY, BURN, AVG_SCORE);
        let reward = Rewarder::amount(524, multiplier);
        assert_gt!(reward, BURN);
    }

    #[test]
    fn test_rewarder_at_lowest_at_average() {
        let multiplier = Rewarder::multiplier(0, TARGET_SUPPLY, BURN, AVG_SCORE);
        let reward = Rewarder::amount(AVG_SCORE, multiplier);
        assert_gt!(reward, BURN);
    }

    #[test]
    fn test_rewarder_at_highest_at_average() {
        let multiplier = Rewarder::multiplier(TARGET_SUPPLY * 2, TARGET_SUPPLY, BURN, AVG_SCORE);
        let reward = Rewarder::amount(AVG_SCORE, multiplier);
        assert_eq!(reward, 0);
        let multiplier = Rewarder::multiplier(TARGET_SUPPLY * 3, TARGET_SUPPLY, BURN, AVG_SCORE);
        let reward = Rewarder::amount(AVG_SCORE, multiplier);
        assert_eq!(reward, 0);
    }

    #[test]
    fn test_base_zero_score() {
        assert_eq!(Rewarder::base(0), 0);
    }

    #[test]
    fn test_base_below_threshold() {
        assert_eq!(Rewarder::base(64), 0);
    }

    #[test]
    fn test_base_at_min_threshold() {
        // score=65, lookup=1 => 1 * TEN_POW_18 / 100
        let expected: u256 = (TEN_POW_18 / 100).into();
        assert_eq!(Rewarder::base(65), expected);
    }

    #[test]
    fn test_base_at_max_score() {
        // score=524, lookup=1000 => 1000 * TEN_POW_18 / 100 = 10 * TEN_POW_18
        let expected: u256 = (10 * TEN_POW_18).into();
        assert_eq!(Rewarder::base(524), expected);
    }

    #[test]
    fn test_base_tier_boundaries() {
        let base_77: u256 = (TEN_POW_18 / 100).into();
        let base_78: u256 = (13 * TEN_POW_18 / 100).into();
        assert_eq!(Rewarder::base(77), base_77);
        assert_eq!(Rewarder::base(78), base_78);
        assert_gt!(Rewarder::base(78), Rewarder::base(77));
    }

    #[test]
    fn test_supply_multiplier_at_target() {
        let m = Rewarder::supply_multiplier(TARGET_SUPPLY, TARGET_SUPPLY);
        assert_eq!(m, MULTIPLIER_PRECISION);
    }

    #[test]
    fn test_supply_multiplier_at_zero_supply() {
        let m = Rewarder::supply_multiplier(0, TARGET_SUPPLY);
        assert_eq!(m, 2 * MULTIPLIER_PRECISION);
    }

    #[test]
    fn test_supply_multiplier_at_double_target() {
        let m = Rewarder::supply_multiplier(TARGET_SUPPLY * 2, TARGET_SUPPLY);
        assert_eq!(m, 0);
    }

    #[test]
    fn test_supply_multiplier_above_double_target() {
        let m = Rewarder::supply_multiplier(TARGET_SUPPLY * 3, TARGET_SUPPLY);
        assert_eq!(m, 0);
    }

    #[test]
    fn test_supply_multiplier_zero_target() {
        let m = Rewarder::supply_multiplier(100, 0);
        assert_eq!(m, 0);
    }

    #[test]
    fn test_supply_multiplier_half_target() {
        let m = Rewarder::supply_multiplier(TARGET_SUPPLY / 2, TARGET_SUPPLY);
        assert_eq!(m, 3 * MULTIPLIER_PRECISION / 2);
    }

    #[test]
    fn test_burn_multiplier_equals_base() {
        let base_val = Rewarder::base(AVG_SCORE);
        let m = Rewarder::burn_multiplier(base_val, AVG_SCORE);
        assert_eq!(m, MULTIPLIER_PRECISION);
    }

    #[test]
    fn test_burn_multiplier_zero_score() {
        let m = Rewarder::burn_multiplier(BURN, 0);
        assert_eq!(m, 0);
    }

    #[test]
    fn test_burn_multiplier_double_burn() {
        let base_val = Rewarder::base(AVG_SCORE);
        let m = Rewarder::burn_multiplier(2 * base_val, AVG_SCORE);
        assert_eq!(m, 2 * MULTIPLIER_PRECISION);
    }

    // ==================== Unit tests: amount ====================

    #[test]
    fn test_amount_zero_score() {
        let reward = Rewarder::amount(0, MULTIPLIER_PRECISION);
        assert_eq!(reward, 0);
    }

    #[test]
    fn test_amount_zero_multiplier() {
        let reward = Rewarder::amount(524, 0);
        assert_eq!(reward, 0);
    }

    #[test]
    fn test_amount_at_precision() {
        // When multiplier = MULTIPLIER_PRECISION, amount = base
        let reward = Rewarder::amount(AVG_SCORE, MULTIPLIER_PRECISION);
        assert_eq!(reward, Rewarder::base(AVG_SCORE));
    }
}
