import { useEffect, useRef, useState } from "react";
import { getSwapQuote } from "@/api/ekubo";
import { TOKEN_DECIMALS } from "@/helpers/payout";

const POLL_INTERVAL = 30_000; // 30 seconds

export function useTokenPrice(
  tokenAddress: string | undefined,
  quoteAddress: string | undefined,
  chainId: string | undefined,
): { price: number | null; isLoading: boolean } {
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!tokenAddress || !quoteAddress || !chainId) return;

    let cancelled = false;

    const fetchPrice = () => {
      if (!hasFetchedRef.current) setIsLoading(true);
      const amount = 100n * 10n ** BigInt(TOKEN_DECIMALS);
      getSwapQuote(amount, tokenAddress, quoteAddress, chainId)
        .then((quote) => {
          if (cancelled) return;
          setPrice(quote.total / 1e6 / 100);
          hasFetchedRef.current = true;
        })
        .catch(() => {
          // keep previous price on error
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    };

    // Fetch immediately
    fetchPrice();

    // Poll on interval
    intervalRef.current = setInterval(fetchPrice, POLL_INTERVAL);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [tokenAddress, quoteAddress, chainId]);

  return { price, isLoading };
}
