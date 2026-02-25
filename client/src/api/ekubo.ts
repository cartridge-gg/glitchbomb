import { getChecksumAddress } from "starknet";

const BASE_URL = "https://prod-api-quoter.ekubo.org";

interface SwapQuote {
  total: number;
  impact: number;
}

export const getSwapQuote = async (
  amount: bigint,
  token: string,
  otherToken: string,
  chainId: string,
): Promise<SwapQuote> => {
  const response = await fetch(
    `${BASE_URL}/${chainId}/${amount.toString()}/${getChecksumAddress(token)}/${getChecksumAddress(otherToken)}`,
  );
  const data = await response.json();
  return {
    total: data?.total_calculated || 0,
    impact: data?.price_impact || 0,
  };
};
