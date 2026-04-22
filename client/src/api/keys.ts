import { Achievement } from "./torii/achievement";
import { LeaderboardReferral } from "./torii/leaderboard-referral";
import { LeaderboardScore } from "./torii/leaderboard-score";
import { Quest } from "./torii/quest";
import { Referral } from "./torii/referral";

export const queryKeys = {
  leaderboardScore: LeaderboardScore.keys,
  leaderboardReferrals: LeaderboardReferral.keys,
  referrals: Referral.keys,
  achievements: Achievement.keys,
  quests: Quest.keys,
} as const;
