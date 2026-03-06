import { ActivityTicker } from "@/components/elements/activity-ticker";
import { DEFAULT_CHAIN_ID } from "@/config";
import { useActivityFeed } from "@/hooks/activity-feed";

export function ActivityTickerBanner() {
  const chainId = BigInt(DEFAULT_CHAIN_ID);
  const items = useActivityFeed(chainId);
  return <ActivityTicker items={items} />;
}
