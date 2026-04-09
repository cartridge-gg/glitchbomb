import type ControllerConnector from "@cartridge/connector/controller";
import {
  useAccount,
  useConnect,
  useDisconnect,
} from "@starknet-react/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { isMobile } from "@/utils/mobile";

const AUTH_CHANGED_EVENT = "cartridge:auth-changed";
const CONTROLLER_STORAGE_PREFIX = "@cartridge/";
const CONTROLLER_STORAGE_KEYS = [
  "lastUsedConnector",
  "session",
  "sessionSigner",
  "sessionPolicies",
  "controller_standalone",
  "wagmi.store",
  "wagmi.connected",
  "wagmi.wallet",
  "walletconnect",
] as const;

function isIosAppWebView() {
  if (typeof navigator === "undefined") return false;
  return navigator.userAgent.includes("PWAShell");
}

function dispatchAuthChanged(authenticated: boolean, source: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(AUTH_CHANGED_EVENT, {
      detail: { authenticated, source },
    }),
  );
}

function clearControllerPersistence() {
  if (typeof window === "undefined") return;

  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (let i = storage.length - 1; i >= 0; i -= 1) {
      const key = storage.key(i);
      if (key?.startsWith(CONTROLLER_STORAGE_PREFIX)) {
        storage.removeItem(key);
      }
    }

    for (const key of CONTROLLER_STORAGE_KEYS) {
      storage.removeItem(key);
    }
  }
}

export function useControllerAuth() {
  const { account, connector } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [username, setUsername] = useState<string>();
  const refreshIdRef = useRef(0);

  const controllerConnector = connector as ControllerConnector | undefined;

  const refreshUsername = useCallback(async () => {
    const refreshId = ++refreshIdRef.current;

    if (!account?.address || !controllerConnector) {
      setUsername(undefined);
      return undefined;
    }

    try {
      const nextUsername = await controllerConnector.username();
      if (refreshId === refreshIdRef.current) {
        setUsername(nextUsername ?? undefined);
      }
      return nextUsername ?? undefined;
    } catch {
      if (refreshId === refreshIdRef.current) {
        setUsername(undefined);
      }
      return undefined;
    }
  }, [account?.address, controllerConnector]);

  useEffect(() => {
    void refreshUsername();
  }, [refreshUsername]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAuthChanged = () => {
      void refreshUsername();
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void refreshUsername();
      }
    };

    window.addEventListener("focus", handleAuthChanged);
    window.addEventListener("storage", handleAuthChanged);
    window.addEventListener(
      AUTH_CHANGED_EVENT,
      handleAuthChanged as EventListener,
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleAuthChanged);
      window.removeEventListener("storage", handleAuthChanged);
      window.removeEventListener(
        AUTH_CHANGED_EVENT,
        handleAuthChanged as EventListener,
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshUsername]);

  const handleConnect = useCallback(async () => {
    const primaryConnector = connectors[0] as ControllerConnector | undefined;
    if (!primaryConnector) return;

    if (isIosAppWebView()) {
      primaryConnector.controller.open({ redirectUrl: window.location.href });
      return;
    }

    await connectAsync({ connector: primaryConnector });
    await refreshUsername();
    dispatchAuthChanged(true, "connect");
  }, [connectAsync, connectors, refreshUsername]);

  const handleLogout = useCallback(async () => {
    setUsername(undefined);
    clearControllerPersistence();

    try {
      await controllerConnector?.disconnect?.();
    } finally {
      disconnect();
      dispatchAuthChanged(false, "logout");
    }
  }, [controllerConnector, disconnect]);

  const handleOpenProfile = useCallback(() => {
    if (isMobile) {
      controllerConnector?.controller.openSettings();
      return;
    }

    controllerConnector?.controller.openProfile("inventory");
  }, [controllerConnector]);

  return {
    username,
    isLoggedIn: Boolean(account?.address),
    handleConnect,
    handleLogout,
    handleOpenProfile,
    refreshUsername,
  };
}
