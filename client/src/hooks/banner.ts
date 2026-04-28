import type ControllerConnector from "@cartridge/connector/controller";
import {
  type ControllerConfig,
  getAvailableConfigs,
  loadConfig,
} from "@cartridge/presets";
import { useAccount, useNetwork } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { queryKeys } from "@/api/keys";
import type { BannerProps } from "@/components/elements";
import { getSetupAddress } from "@/config";
import { useBundles } from "@/contexts/bundles";
import { useControllers } from "@/contexts/controllers";
import { usePreserveSearchNavigate } from "@/lib/router";

export interface GameBanner {
  preset: string;
  name: string;
  bundle?: number;
  position?: number;
  origin?: string;
  onClick?: () => void;
}

const BANNERS: GameBanner[] = [
  { preset: "glitch-bomb", name: "social", bundle: 0 },
  { preset: "nums", name: "nums", position: 0 },
];

const fetchBannerConfigs = async (): Promise<Map<string, ControllerConfig>> => {
  const available = await getAvailableConfigs();
  const presets = [...new Set(BANNERS.map((b) => b.preset))];
  const configs = new Map<string, ControllerConfig>();
  await Promise.all(
    presets
      .filter((p) => available.includes(p))
      .map(async (p) => {
        const config = await loadConfig(p);
        if (config) configs.set(p, config);
      }),
  );
  return configs;
};

export const useBanners = () => {
  const { account, connector } = useAccount();
  const { chain } = useNetwork();
  const { issuances } = useBundles();
  const navigate = usePreserveSearchNavigate();
  const { find } = useControllers();

  const { data: configs, isLoading } = useQuery({
    queryKey: queryKeys.banners(),
    queryFn: fetchBannerConfigs,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  const username = useMemo(() => {
    if (!account?.address) return undefined;
    const controller = find(account.address);
    return controller?.username;
  }, [account?.address, find]);

  const referralLink = useMemo(() => {
    if (!username) return "";
    return `${window.location.origin}/?ref=${encodeURIComponent(username)}`;
  }, [username]);

  const handleShare = useCallback(async () => {
    if (!username || !chain) return;
    const onPurchaseComplete = () => {
      navigate("/game");
    };

    const socialClaimOptions = {
      shareMessage: `My application was accepted!\nHave you checked yours?\n🔢 @glitchbombio\n${referralLink}`,
    };

    const controller = connector as ControllerConnector;
    const registry = getSetupAddress(chain.id);
    await controller.controller.openBundle(0, registry, {
      onPurchaseComplete,
      socialClaimOptions,
    });
  }, [navigate, chain, username, referralLink, connector]);

  const banners = useMemo<BannerProps[]>(() => {
    if (!configs) return [];
    return BANNERS.map((b) => {
      const entry: BannerProps = {
        preset: b.preset,
        name: b.name,
        config: configs.get(b.preset),
      };
      const issuance = issuances.find((i) => i.bundle_id === b.bundle);
      if (b.position !== undefined) entry.position = b.position;
      if (b.origin) entry.origin = b.origin;
      if (b.name === "social" && !issuance) entry.onClick = handleShare;
      if (b.name === "social" && (!account || !!issuance))
        entry.disabled = true;
      if (b.name === "social" && !!issuance) entry.hidden = true;
      if (b.onClick) entry.onClick = b.onClick;
      return entry;
    });
  }, [configs, issuances, account, handleShare]);

  return { banners, loading: isLoading };
};
