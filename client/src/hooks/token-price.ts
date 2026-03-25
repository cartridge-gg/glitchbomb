import { useCallback, useEffect, useState } from "react";
import { getSwapQuote } from "@/api/ekubo";
import { TOKEN_DECIMALS } from "@/helpers/payout";

export function useTokenPrice(
  tokenAddress: string | undefined,
  quoteAddress: string | undefined,
  chainId: string | undefined,
): { price: number | null; isLoading: boolean; refetch: () => void } {
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(() => {
    if (!tokenAddress || !quoteAddress || !chainId) return;
    setIsLoading(true);
    const amount = 100n * 10n ** BigInt(TOKEN_DECIMALS);
    getSwapQuote(amount, tokenAddress, quoteAddress, chainId)
      .then((quote) => {
        setPrice(quote.total / 1e6 / 100);
      })
      .catch(() => {
        // keep previous price on error
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [tokenAddress, quoteAddress, chainId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { price, isLoading, refetch };
}
