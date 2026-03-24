import { type ReactNode, useCallback, useState } from "react";
import { LoadingContext } from "./loading-context-def";

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [readyMap, setReadyMap] = useState<Record<string, boolean>>({});

  const setReady = useCallback((key: string, ready: boolean) => {
    setReadyMap((prev) => {
      if (prev[key] === ready) return prev;
      return { ...prev, [key]: ready };
    });
  }, []);

  // Ready when the core "entities" signal exists and every registered signal is true
  const allReady =
    "entities" in readyMap && Object.values(readyMap).every(Boolean);

  return (
    <LoadingContext.Provider value={{ setReady, allReady }}>
      {children}
    </LoadingContext.Provider>
  );
}
