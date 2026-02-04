import { useContext } from "react";
import { EntitiesContext } from "./entities-context";

export function useEntitiesContext() {
  const context = useContext(EntitiesContext);
  if (!context) {
    throw new Error(
      "useEntitiesContext must be used within a EntitiesProvider",
    );
  }
  return context;
}
