import { useContext, useEffect } from "react";
import { LoadingContext } from "./loading-context-def";

/** Report a loading signal to the loading context */
export function useLoadingSignal(key: string, ready: boolean) {
  const { setReady } = useContext(LoadingContext);
  useEffect(() => {
    setReady(key, ready);
  }, [key, ready, setReady]);
}

export function useLoadingContext() {
  return useContext(LoadingContext);
}
