import { useSyncExternalStore } from "react";

export const ONCHAIN_GAMES_ENABLED =
  import.meta.env.VITE_ENABLE_ONCHAIN_GAMES !== "false";
export const OFFLINE_MODE_ENV =
  import.meta.env.VITE_OFFLINE_MODE === "true" || !ONCHAIN_GAMES_ENABLED;

const OFFLINE_EVENT = "gb-offline-mode";
let offlineModeState = OFFLINE_MODE_ENV;

function loadStoredMode(): boolean {
  if (OFFLINE_MODE_ENV) return true;
  if (typeof window === "undefined") return offlineModeState;
  try {
    return window.localStorage.getItem("gb_offline_mode") === "1";
  } catch {
    return offlineModeState;
  }
}

export function isOfflineMode(): boolean {
  if (OFFLINE_MODE_ENV) return true;
  if (typeof window === "undefined") return false;
  return offlineModeState || loadStoredMode();
}

export function setOfflineMode(enabled: boolean) {
  if (!ONCHAIN_GAMES_ENABLED) {
    offlineModeState = true;
    return;
  }
  if (OFFLINE_MODE_ENV) return;
  offlineModeState = enabled;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("gb_offline_mode", enabled ? "1" : "0");
  } catch {
    // Ignore storage errors.
  }
  window.dispatchEvent(new Event(OFFLINE_EVENT));
}

export function subscribeOfflineMode(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    offlineModeState = loadStoredMode();
    callback();
  };
  window.addEventListener(OFFLINE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(OFFLINE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useOfflineMode(): boolean {
  return useSyncExternalStore(
    subscribeOfflineMode,
    isOfflineMode,
    isOfflineMode,
  );
}
