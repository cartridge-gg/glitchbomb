import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type ModalKind =
  | "leaderboard"
  | "quests"
  | "achievements"
  | "referrals"
  | "settings"
  | "purchase";

interface ModalContextType {
  current: ModalKind | null;
  open: (modal: ModalKind) => void;
  close: () => void;
  toggle: (modal: ModalKind) => void;
  isOpen: (modal: ModalKind) => boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ModalKind | null>(null);

  const open = useCallback((modal: ModalKind) => setCurrent(modal), []);
  const close = useCallback(() => setCurrent(null), []);
  const toggle = useCallback(
    (modal: ModalKind) => setCurrent((prev) => (prev === modal ? null : modal)),
    [],
  );
  const isOpen = useCallback(
    (modal: ModalKind) => current === modal,
    [current],
  );

  const value = useMemo(
    () => ({ current, open, close, toggle, isOpen }),
    [current, open, close, toggle, isOpen],
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
};
