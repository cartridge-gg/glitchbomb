import type * as torii from "@dojoengine/torii-wasm";
import { createContext } from "react";
import type { Config, Game, Starterpack } from "@/models";

export interface EntitiesContextType {
  client?: torii.ToriiClient;
  game?: Game;
  config?: Config;
  starterpacks: Starterpack[];
  status: "loading" | "error" | "success";
  refresh: () => Promise<void>;
  setGameId: (id: number) => void;
}

export const EntitiesContext = createContext<EntitiesContextType | undefined>(
  undefined
);
