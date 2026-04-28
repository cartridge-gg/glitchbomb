import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/keys";
import {
  LeaderboardScore,
  type LeaderboardScoreRow,
} from "@/api/torii/leaderboard-score";

export type LeaderboardScoreRowData = LeaderboardScoreRow;

export const useLeaderboard = (options?: { enabled?: boolean }) => {
  const query = useQuery<LeaderboardScoreRowData[]>({
    queryKey: queryKeys.leaderboardScore(),
    queryFn: LeaderboardScore.fetch,
    enabled: options?.enabled ?? true,
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
