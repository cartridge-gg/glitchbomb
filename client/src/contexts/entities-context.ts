import { createContext } from "react";
import type * as torii from "@dojoengine/torii-wasm";
import type { Config, Game, Pack, Starterpack } from "@/models";

export interface EntitiesContextType {
  client?: torii.ToriiClient;
  pack?: Pack;
  game?: Game;
  config?: Config;
  starterpack?: Starterpack;
  status: "loading" | "error" | "success";
  refresh: () => Promise<void>;
  setGameId: (id: number) => void;
  setPackId: (id: number) => void;
}

export const EntitiesContext = createContext<EntitiesContextType | undefined>(
  undefined,
);
