import { useSyncExternalStore } from "react";

let offlineModeState = false;

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function isOfflineMode(): boolean {
  return offlineModeState;
}

export function setOfflineMode(enabled: boolean) {
  if (offlineModeState === enabled) return;
  offlineModeState = enabled;
  emit();
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function useOfflineMode(): boolean {
  return useSyncExternalStore(subscribe, isOfflineMode, isOfflineMode);
}
