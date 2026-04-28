import { createContext, type ReactNode, useContext, useMemo } from "react";

interface PurchaseModalContextType {
  openPurchaseScene: () => void;
  handleBuyGame: () => void;
}

const PurchaseModalContext = createContext<
  PurchaseModalContextType | undefined
>(undefined);

export function PurchaseModalProvider({
  children,
  openPurchaseScene,
  handleBuyGame,
}: {
  children: ReactNode;
  openPurchaseScene: () => void;
  handleBuyGame: () => void;
}) {
  const value = useMemo(
    () => ({ openPurchaseScene, handleBuyGame }),
    [openPurchaseScene, handleBuyGame],
  );
  return (
    <PurchaseModalContext.Provider value={value}>
      {children}
    </PurchaseModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePurchaseModal = () => {
  const ctx = useContext(PurchaseModalContext);
  if (!ctx)
    throw new Error(
      "usePurchaseModal must be used within PurchaseModalProvider",
    );
  return ctx;
};
