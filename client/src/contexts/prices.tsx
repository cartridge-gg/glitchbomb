import { useNetwork } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { getSwapQuote } from "@/api/ekubo";
import { queryKeys } from "@/api/keys";
import { getFaucetAddress, getTokenAddress } from "@/config";
import { TOKEN_DECIMALS } from "@/helpers/payout";

const fetchTokenUsdPrice = async (
  chainId: string,
  tokenAddress: string,
  quoteAddress: string,
): Promise<string | null> => {
  try {
    const amount = 100n * 10n ** BigInt(TOKEN_DECIMALS);
    const swap = await getSwapQuote(
      amount,
      tokenAddress,
      quoteAddress,
      chainId,
    );
    const price = (swap.total / 1e6 / 100).toString();
    return price;
  } catch (error) {
    console.error(`Failed to fetch price for ${tokenAddress}:`, error);
    return null;
  }
};

const fetchAllPrices = async (
  chainId: string,
  tokenAddresses: string[],
  quoteAddress: string,
): Promise<Map<string, string>> => {
  const pricePromises = tokenAddresses.map((address) =>
    fetchTokenUsdPrice(chainId, address, quoteAddress),
  );

  const prices = await Promise.allSettled(pricePromises);

  const priceMap = new Map<string, string>();
  tokenAddresses.forEach((address, index) => {
    const result = prices[index];
    if (result.status === "fulfilled" && result.value) {
      priceMap.set(address.toLowerCase(), result.value);
    }
  });

  return priceMap;
};

interface PricesContextType {
  getTokenPrice: (address: string) => string | null;
  getGlitchPrice: () => string | null;
  isLoading: boolean;
}

const PricesContext = createContext<PricesContextType | undefined>(undefined);

export function PricesProvider({ children }: { children: ReactNode }) {
  const { chain } = useNetwork();
  const tokenAddress = useMemo(() => getTokenAddress(chain.id), [chain.id]);
  const quoteAddress = useMemo(() => getFaucetAddress(chain.id), [chain.id]);
  const chainId = useMemo(() => chain.id.toString(), [chain.id]);

  const tokenAddresses = useMemo(() => [tokenAddress], [tokenAddress]);

  const query = useQuery({
    queryKey: queryKeys.prices(tokenAddresses.join(","), quoteAddress ?? ""),
    queryFn: () => fetchAllPrices(chainId, tokenAddresses, quoteAddress),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: tokenAddresses.length > 0 && !!quoteAddress,
  });

  const getTokenPrice = useMemo(() => {
    return (address: string): string | null => {
      if (!query.data) return null;
      return query.data.get(address.toLowerCase()) || null;
    };
  }, [query.data]);

  const getGlitchPrice = useMemo(() => {
    return (): string | null => {
      return getTokenPrice(tokenAddress);
    };
  }, [getTokenPrice, tokenAddress]);

  const value = useMemo(
    () => ({
      getTokenPrice,
      getGlitchPrice,
      isLoading: query.isLoading,
    }),
    [getTokenPrice, getGlitchPrice, query.isLoading],
  );

  return (
    <PricesContext.Provider value={value}>{children}</PricesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePrices = () => {
  const ctx = useContext(PricesContext);
  if (!ctx) throw new Error("usePrices must be used within PricesProvider");
  return ctx;
};
