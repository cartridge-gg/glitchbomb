import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount, useConnect } from "@starknet-react/core";
import { useCallback, useEffect, useState } from "react";
import { Connect, Profile } from "@/components/elements";

export const Connection = () => {
  const { account, connector } = useAccount();
  const [username, setUsername] = useState<string>();
  const { connectAsync, connectors } = useConnect();

  const onProfileClick = useCallback(async () => {
    (connector as never as ControllerConnector)?.controller.openProfile(
      "inventory",
    );
  }, [connector]);

  const onConnectClick = useCallback(async () => {
    await connectAsync({ connector: connectors[0] });
  }, [connectAsync, connectors]);

  useEffect(() => {
    if (!connector) return;
    (connector as never as ControllerConnector).controller
      .username()
      ?.then((username) => {
        setUsername(username);
      });
  }, [connector]);

  return account && username ? (
    <Profile username={`${username}`} onClick={onProfileClick} />
  ) : (
    <Connect highlight onClick={onConnectClick} />
  );
};
