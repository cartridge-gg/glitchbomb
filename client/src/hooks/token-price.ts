import { useEffect, useState } from "react";
import { getSwapQuote } from "@/api/ekubo";
import { TOKEN_DECIMALS } from "@/helpers/payout";

export function useTokenPrice(
  tokenAddress: string | undefined,
  quoteAddress: string | undefined,
  chainId: string | undefined,
): { price: number | null; isLoading: boolean } {
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!tokenAddress || !quoteAddress || !chainId) return;

    let cancelled = false;
    setIsLoading(true);

    const amount = 100n * 10n ** BigInt(TOKEN_DECIMALS);
    getSwapQuote(amount, tokenAddress, quoteAddress, chainId)
      .then((quote) => {
        if (cancelled) return;
        setPrice(quote.total / 1e6 / 100);
      })
      .catch(() => {
        if (!cancelled) setPrice(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tokenAddress, quoteAddress, chainId]);

  return { price, isLoading };
}
