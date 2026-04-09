import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect } from "@starknet-react/core";
import { useCallback } from "react";
import { Connect, Profile } from "@/components/elements";
import { useControllerUsername } from "@/hooks/use-controller-username";
import { isMobile } from "@/utils/mobile";

export const Connection = () => {
  const { account, connector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { username } = useControllerUsername();

  const onProfileClick = useCallback(async () => {
    const controller = (connector as never as ControllerConnector)?.controller;
    if (isMobile) {
      controller?.openSettings();
    } else {
      controller?.openProfile("inventory");
    }
  }, [connector]);

  const onConnectClick = useCallback(async () => {
    await connectAsync({ connector: connectors[0] });
  }, [connectAsync, connectors]);

  return account && username ? (
    <Profile username={`${username}`} onClick={onProfileClick} />
  ) : (
    <Connect highlight onClick={onConnectClick} />
  );
};
