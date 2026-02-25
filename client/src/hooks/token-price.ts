import { useEffect, useState } from "react";
import { getSwapQuote } from "@/api/ekubo";
import { TOKEN_DECIMALS } from "@/helpers/payout";

let cachedPrice: number | null = null;
let cachedAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useTokenPrice(
  tokenAddress: string | undefined,
  quoteAddress: string | undefined,
  chainId: string | undefined,
): { price: number | null; isLoading: boolean } {
  const [price, setPrice] = useState<number | null>(cachedPrice);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!tokenAddress || !quoteAddress || !chainId) return;

    if (cachedPrice !== null && Date.now() - cachedAt < CACHE_TTL) {
      setPrice(cachedPrice);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const amount = 100n * 10n ** BigInt(TOKEN_DECIMALS);
    getSwapQuote(amount, tokenAddress, quoteAddress, chainId)
      .then((quote) => {
        if (cancelled) return;
        const p = quote.total / 1e6 / 100;
        cachedPrice = p;
        cachedAt = Date.now();
        setPrice(p);
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
