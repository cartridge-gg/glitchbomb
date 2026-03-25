import { useContext, useEffect } from "react";
import { LoadingContext } from "./loading-context-def";

/** Report a loading signal to the loading context; removed on unmount */
export function useLoadingSignal(key: string, ready: boolean) {
  const { setReady, removeSignal } = useContext(LoadingContext);
  useEffect(() => {
    setReady(key, ready);
  }, [key, ready, setReady]);

  // Remove from the map when the component unmounts so stale signals
  // don't keep allReady false (or prevent it from becoming true).
  useEffect(() => {
    return () => removeSignal(key);
  }, [key, removeSignal]);
}

export function useLoadingContext() {
  return useContext(LoadingContext);
}
