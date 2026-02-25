use crate::constants::{MAX_SCORE, REWARD_NUMERATOR, REWARD_OFFSET};

#[generate_trait]
pub impl RewarderImpl of RewarderTrait {
    /// Compute the reward for a given score, token supply, and target supply.
    /// Uses a progressive x^5 curve that rewards higher scores disproportionately
    /// and adjusts based on supply vs target.
    /// Formula: y = num / ((P+b)^5 - p^5) - num / (P+b)^5
    fn amount(score: u16, supply: u256, target: u256) -> u64 {
        if score == 0 {
            return 0;
        }

        // No reward if supply meets or exceeds 2x target
        if supply >= target * 2 {
            return 0;
        }

        let numerator: u256 = REWARD_NUMERATOR.into();
        let max_score: u256 = MAX_SCORE.into();
        let offset: u256 = REWARD_OFFSET.into();

        // Compute the supply adjustment factor:
        // num = NUMERATOR ± NUMERATOR * |target - supply| / target
        let num: u256 = if supply <= target {
            numerator + numerator * (target - supply) / target
        } else {
            numerator - numerator * (supply - target) / target
        };

        // den = (MAX_SCORE + REWARD_OFFSET)^5 = 510^5
        let base: u256 = max_score + offset;
        let base2: u256 = base * base;
        let base4: u256 = base2 * base2;
        let den: u256 = base4 * base;

        let score_u256: u256 = score.into();
        let score2: u256 = score_u256 * score_u256;
        let score4: u256 = score2 * score2;
        let score5: u256 = score4 * score_u256;

        // reward = num / (den - score^5) - num / den
        let reward: u256 = num / (den - score5) - num / den;

        reward.try_into().unwrap()
    }
}

#[cfg(test)]
mod tests {
    use super::RewarderImpl;

    const TARGET: u256 = 1_000_000_000;

    #[test]
    fn test_reward_at_max_score() {
        // Score 500 at target supply should yield ~10,000,000,000
        let reward = RewarderImpl::amount(500, TARGET, TARGET);
        assert(reward >= 9_900_000_000 && reward <= 10_100_000_000, 'max score reward ~10B');
    }

    #[test]
    fn test_reward_at_490() {
        // Score 490 should yield ~4,700,000,000
        let reward = RewarderImpl::amount(490, TARGET, TARGET);
        assert(reward >= 4_500_000_000 && reward <= 4_900_000_000, 'score 490 reward ~4.7B');
    }

    #[test]
    fn test_reward_at_400() {
        // Score 400 should yield ~440,000,000
        let reward = RewarderImpl::amount(400, TARGET, TARGET);
        assert(reward >= 400_000_000 && reward <= 500_000_000, 'score 400 reward ~440M');
    }

    #[test]
    fn test_reward_low_score() {
        // Score 100 yields a small reward (~500k with 100kx numerator)
        let reward = RewarderImpl::amount(100, TARGET, TARGET);
        assert(reward >= 100_000 && reward <= 1_000_000, 'low score reward small');
    }

    #[test]
    fn test_reward_zero_score() {
        let reward = RewarderImpl::amount(0, TARGET, TARGET);
        assert(reward == 0, 'zero score reward == 0');
    }

    #[test]
    fn test_reward_zero_when_supply_exceeds_double_target() {
        let reward = RewarderImpl::amount(500, TARGET * 2 + 1, TARGET);
        assert(reward == 0, 'over 2x target => 0');
    }

    #[test]
    fn test_reward_higher_when_supply_below_target() {
        let reward_at_target = RewarderImpl::amount(500, TARGET, TARGET);
        let reward_below = RewarderImpl::amount(500, TARGET / 2, TARGET);
        assert(reward_below > reward_at_target, 'below target => higher reward');
    }

    #[test]
    fn test_reward_lower_when_supply_above_target() {
        let reward_at_target = RewarderImpl::amount(500, TARGET, TARGET);
        let reward_above = RewarderImpl::amount(500, TARGET + TARGET / 2, TARGET);
        assert(reward_above < reward_at_target, 'above target => lower reward');
    }

    #[test]
    fn test_reward_at_exactly_double_target() {
        // At exactly 2x target, supply adjustment makes num = 0
        // so reward should be 0
        let reward = RewarderImpl::amount(500, TARGET * 2, TARGET);
        assert(reward == 0, 'at 2x target => 0');
    }

    #[test]
    fn test_reward_score_10() {
        // Very low score yields near-zero reward
        let reward = RewarderImpl::amount(10, TARGET, TARGET);
        assert(reward <= 100, 'score 10 reward near 0');
    }
}
