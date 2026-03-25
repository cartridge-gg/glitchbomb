import { createContext } from "react";

export interface LoadingContextType {
  /** Mark a named signal as loading or ready */
  setReady: (key: string, ready: boolean) => void;
  /** Remove a signal from the ready map (on unmount) */
  removeSignal: (key: string) => void;
  /** True once the "entities" signal is registered and all registered signals are ready */
  allReady: boolean;
}

export const LoadingContext = createContext<LoadingContextType>({
  setReady: () => {},
  removeSignal: () => {},
  allReady: false,
});
