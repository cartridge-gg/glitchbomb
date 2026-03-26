#[generate_trait]
pub impl RewarderImpl of RewarderTrait {
    /// Compute the reward for a given score, token supply, and target supply.
    /// Uses a stepped lookup table that maps score ranges to base rewards,
    /// then scales by REWARD_SCALE to produce raw token units (6-decimal token),
    /// then scales linearly based on supply vs target (2x at zero supply, 1x at target, 0x at
    /// 2*target).
    fn amount(score: u16, supply: u256, target: u256) -> u64 {
        if score == 0 {
            return 0;
        }

        // No reward if supply meets or exceeds 2x target
        if supply >= target * 2 {
            return 0;
        }

        let base: u256 = Self::base_reward(score).into();
        if base == 0 {
            return 0;
        }

        // Scale table values to raw token units (table is *100, token has 6 decimals)
        let scaled: u256 = base * crate::constants::REWARD_SCALE;

        // Supply adjustment: (2 * target - supply) / target
        // Yields 2 at supply=0, 1 at supply=target, 0 at supply=2*target
        let reward: u256 = scaled * (2 * target - supply) / target;

        reward.try_into().unwrap()
    }

    /// Stepped lookup table: score thresholds map to base reward values (table values * 100).
    fn base_reward(score: u16) -> u16 {
        if score >= 524 {
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
        }
    }
}

#[cfg(test)]
mod tests {
    use super::RewarderImpl;

    const TARGET: u256 = 1_000_000_000;

    // All expected values = base_reward * REWARD_SCALE(10_000) * supply_factor

    #[test]
    fn test_reward_at_max_score() {
        // Score 524 at target supply => base 1000 * 10_000 = 10_000_000 (10 GLITCH)
        let reward = RewarderImpl::amount(524, TARGET, TARGET);
        assert(reward == 10_000_000, 'max score reward');
    }

    #[test]
    fn test_reward_at_500() {
        // Score 500 falls in [428, 524) => base 720 * 10_000 = 7_200_000
        let reward = RewarderImpl::amount(500, TARGET, TARGET);
        assert(reward == 7_200_000, 'score 500 reward');
    }

    #[test]
    fn test_reward_at_400() {
        // Score 400 falls in [356, 428) => base 530 * 10_000 = 5_300_000
        let reward = RewarderImpl::amount(400, TARGET, TARGET);
        assert(reward == 5_300_000, 'score 400 reward');
    }

    #[test]
    fn test_reward_at_100() {
        // Score 100 falls in [100, 106) => base 40 * 10_000 = 400_000
        let reward = RewarderImpl::amount(100, TARGET, TARGET);
        assert(reward == 400_000, 'score 100 reward');
    }

    #[test]
    fn test_reward_zero_score() {
        let reward = RewarderImpl::amount(0, TARGET, TARGET);
        assert(reward == 0, 'zero score reward == 0');
    }

    #[test]
    fn test_reward_below_threshold() {
        // Score 64 is below the first tier (65)
        let reward = RewarderImpl::amount(64, TARGET, TARGET);
        assert(reward == 0, 'below 65 => 0');
    }

    #[test]
    fn test_reward_zero_when_supply_exceeds_double_target() {
        let reward = RewarderImpl::amount(524, TARGET * 2 + 1, TARGET);
        assert(reward == 0, 'over 2x target => 0');
    }

    #[test]
    fn test_reward_higher_when_supply_below_target() {
        let reward_at_target = RewarderImpl::amount(524, TARGET, TARGET);
        let reward_below = RewarderImpl::amount(524, TARGET / 2, TARGET);
        assert(reward_below > reward_at_target, 'below target => higher reward');
        // base 1000 * 10_000, factor = 1.5 => 15_000_000
        assert(reward_below == 15_000_000, 'half supply => 1.5x');
    }

    #[test]
    fn test_reward_lower_when_supply_above_target() {
        let reward_at_target = RewarderImpl::amount(524, TARGET, TARGET);
        let reward_above = RewarderImpl::amount(524, TARGET + TARGET / 2, TARGET);
        assert(reward_above < reward_at_target, 'above target => lower reward');
        // base 1000 * 10_000, factor = 0.5 => 5_000_000
        assert(reward_above == 5_000_000, '1.5x supply => 0.5x');
    }

    #[test]
    fn test_reward_at_exactly_double_target() {
        let reward = RewarderImpl::amount(524, TARGET * 2, TARGET);
        assert(reward == 0, 'at 2x target => 0');
    }

    #[test]
    fn test_reward_at_zero_supply() {
        // At zero supply, factor = 2 => 1000 * 10_000 * 2 = 20_000_000
        let reward = RewarderImpl::amount(524, 0, TARGET);
        assert(reward == 20_000_000, 'zero supply => 2x');
    }

    #[test]
    fn test_reward_score_10() {
        // Score 10 is below the 65 threshold
        let reward = RewarderImpl::amount(10, TARGET, TARGET);
        assert(reward == 0, 'score 10 => 0');
    }

    #[test]
    fn test_base_reward_boundaries() {
        // Check a few boundary values
        assert(RewarderImpl::base_reward(65) == 1, 'base at 65');
        assert(RewarderImpl::base_reward(77) == 1, 'base at 77');
        assert(RewarderImpl::base_reward(78) == 13, 'base at 78');
        assert(RewarderImpl::base_reward(148) == 100, 'base at 148');
        assert(RewarderImpl::base_reward(523) == 720, 'base at 523');
        assert(RewarderImpl::base_reward(524) == 1000, 'base at 524');
    }
}
