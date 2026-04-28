import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/keys";
import {
  LeaderboardReferral,
  type LeaderboardReferralRow,
} from "@/api/torii/leaderboard-referral";

export type LeaderboardReferralRowData = LeaderboardReferralRow;

export const useLeaderboardReferral = (
  bundleIds: number[],
  protocolFee: number,
  referralFee: number,
  options?: { enabled?: boolean },
) => {
  const query = useQuery<LeaderboardReferralRowData[]>({
    queryKey: queryKeys.leaderboardReferrals(bundleIds),
    queryFn: () =>
      LeaderboardReferral.fetch(bundleIds, protocolFee, referralFee),
    enabled: (options?.enabled ?? true) && bundleIds.length > 0,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
};
