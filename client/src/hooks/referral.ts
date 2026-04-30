import { useAccount } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { queryKeys } from "@/api/keys";
import {
  Referral as ReferralApi,
  type ReferralRow,
} from "@/api/torii/referral";
import { PROTOCOL_FEE, REFERRAL_FEE } from "@/constants";
import { useEntitiesContext } from "@/contexts/use-entities-context";

export type Referral = ReferralRow;

export const useReferral = () => {
  const { address } = useAccount();
  const { starterpacks } = useEntitiesContext();
  const bundleIds = useMemo(
    () => starterpacks.map((pack) => Number(pack.id)),
    [starterpacks],
  );

  const query = useQuery<Referral[]>({
    queryKey: queryKeys.referrals(address, bundleIds),
    queryFn: () => {
      if (!address) throw new Error("Account address is required");
      return ReferralApi.fetch(address, bundleIds, PROTOCOL_FEE, REFERRAL_FEE);
    },
    enabled: !!address && bundleIds.length > 0,
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    refetchInterval: 120_000,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
};
