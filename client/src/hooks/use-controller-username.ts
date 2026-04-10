import type ControllerConnector from "@cartridge/connector/controller";
import { useAccount } from "@starknet-react/core";
import { useCallback, useEffect, useRef, useState } from "react";

const AUTH_CHANGED_EVENT = "cartridge:auth-changed";

export function useControllerUsername() {
  const { account, connector } = useAccount();
  const [username, setUsername] = useState<string>();
  const refreshIdRef = useRef(0);

  const controllerConnector = connector as ControllerConnector | undefined;

  const refreshUsername = useCallback(async () => {
    const refreshId = ++refreshIdRef.current;

    if (!account?.address || !controllerConnector) {
      setUsername(undefined);
      return;
    }

    try {
      const nextUsername = await controllerConnector.controller.username?.();
      if (refreshId === refreshIdRef.current) {
        setUsername(nextUsername ?? undefined);
      }
    } catch {
      if (refreshId === refreshIdRef.current) {
        setUsername(undefined);
      }
    }
  }, [account?.address, controllerConnector]);

  useEffect(() => {
    void refreshUsername();
  }, [refreshUsername]);

  useEffect(() => {
    const handleRefresh = () => {
      void refreshUsername();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void refreshUsername();
      }
    };

    window.addEventListener("focus", handleRefresh);
    window.addEventListener(AUTH_CHANGED_EVENT, handleRefresh as EventListener);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener(
        AUTH_CHANGED_EVENT,
        handleRefresh as EventListener,
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshUsername]);

  return { username, refreshUsername };
}
