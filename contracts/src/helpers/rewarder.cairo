use crate::constants::{MAX_SCORE, MIN_REWARD, REWARD_NUMERATOR};

#[generate_trait]
pub impl RewarderImpl of RewarderTrait {
    /// Compute the reward for a given score, token supply, and target supply.
    /// Adapted from the nums contract: uses a progressive curve that rewards
    /// higher scores disproportionately and adjusts based on supply vs target.
    fn amount(score: u16, supply: u256, target: u256) -> u64 {
        // No reward if supply meets or exceeds 2x target
        if supply >= target * 2 {
            return 0;
        }

        let numerator: u256 = REWARD_NUMERATOR.into();
        let min_reward: u256 = MIN_REWARD.into();
        let max_score: u256 = MAX_SCORE.into();

        // Compute the supply adjustment factor:
        // num = NUMERATOR ± NUMERATOR * |target - supply| / target
        let num: u256 = if supply <= target {
            numerator + numerator * (target - supply) / target
        } else {
            numerator - numerator * (supply - target) / target
        };

        // den = (MAX_SCORE + 3)^5 = 503^5
        let base: u256 = max_score + 3;
        let base2: u256 = base * base;
        let base4: u256 = base2 * base2;
        let den: u256 = base4 * base;

        let score_u256: u256 = score.into();
        let score2: u256 = score_u256 * score_u256;
        let score4: u256 = score2 * score2;
        let score5: u256 = score4 * score_u256;

        // reward = num / (den - score^5) - (num - MIN_REWARD * den) / den
        let reward: u256 = num / (den - score5) - (num - min_reward * den) / den;

        reward.try_into().unwrap()
    }
}

#[cfg(test)]
mod tests {
    use super::RewarderImpl;

    const TARGET: u256 = 1_000_000;

    #[test]
    fn test_reward_at_max_score() {
        // Score 500 at target supply should yield ~500
        let reward = RewarderImpl::amount(500, TARGET, TARGET);
        assert(reward >= 490 && reward <= 510, 'max score reward ~500');
    }

    #[test]
    fn test_reward_at_490() {
        // Score 490 should yield ~109
        let reward = RewarderImpl::amount(490, TARGET, TARGET);
        assert(reward >= 100 && reward <= 120, 'score 490 reward ~109');
    }

    #[test]
    fn test_reward_at_400() {
        // Score 400 should yield ~8
        let reward = RewarderImpl::amount(400, TARGET, TARGET);
        assert(reward >= 5 && reward <= 12, 'score 400 reward ~8');
    }

    #[test]
    fn test_reward_low_score() {
        // Score below 250 should yield MIN_REWARD (1)
        let reward = RewarderImpl::amount(100, TARGET, TARGET);
        assert(reward == 1, 'low score reward == 1');
    }

    #[test]
    fn test_reward_zero_score() {
        let reward = RewarderImpl::amount(0, TARGET, TARGET);
        assert(reward == 1, 'zero score reward == 1');
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
        let reward = RewarderImpl::amount(10, TARGET, TARGET);
        assert(reward == 1, 'score 10 reward == 1');
    }
}
