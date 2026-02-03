import { useSyncExternalStore } from "react";

export const OFFLINE_MODE_ENV =
  import.meta.env.VITE_OFFLINE_MODE === "true";

const OFFLINE_EVENT = "gb-offline-mode";

export function isOfflineMode(): boolean {
  if (OFFLINE_MODE_ENV) return true;
  if (typeof window === "undefined") return false;
  const path = window.location.pathname || "";
  if (!path.startsWith("/games") && !path.startsWith("/play")) {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get("offline") === "1" || params.get("offline") === "true") {
    return true;
  }
  try {
    return window.localStorage.getItem("gb_offline_mode") === "1";
  } catch {
    return false;
  }
}

export function setOfflineMode(enabled: boolean) {
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
  const handler = () => callback();
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
