import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import * as torii from "@dojoengine/torii-wasm";
import { useAccount } from "@starknet-react/core";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { NAMESPACE } from "@/constants";
import {
  CONFIG,
  Config,
  GAME,
  Game,
  PACK,
  Pack,
  type RawConfig,
  type RawGame,
  type RawPack,
  type RawStarterpack,
  STARTERPACK,
  Starterpack,
} from "@/models";

interface EntitiesContextType {
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

const EntitiesContext = createContext<EntitiesContextType | undefined>(
  undefined,
);

const getEntityQuery = (namespace: string) => {
  const config: `${string}-${string}` = `${namespace}-${CONFIG}`;
  const starterpack: `${string}-${string}` = `${namespace}-${STARTERPACK}`;
  const clauses = new ClauseBuilder().keys(
    [config, starterpack],
    [undefined],
    "FixedLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

const getPackQuery = (packId: number) => {
  const pack: `${string}-${string}` = `${NAMESPACE}-${PACK}`;
  const clauses = new ClauseBuilder().keys(
    [pack],
    [`0x${packId.toString(16).padStart(16, "0")}`],
    "FixedLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

const getGameQuery = (packId: number, gameId: number) => {
  const game: `${string}-${string}` = `${NAMESPACE}-${GAME}`;
  const clauses = new ClauseBuilder().keys(
    [game],
    [`0x${packId.toString(16).padStart(16, "0")}`, `${gameId.toString()}`],
    "FixedLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

export function EntitiesProvider({ children }: { children: React.ReactNode }) {
  const account = useAccount();
  const [client, setClient] = useState<torii.ToriiClient>();
  const entitiesSubscriptionRef = useRef<torii.Subscription | null>(null);
  const packSubscriptionRef = useRef<torii.Subscription | null>(null);
  const gameSubscriptionRef = useRef<torii.Subscription | null>(null);
  const [packId, setPackId] = useState<number>(0);
  const [gameId, setGameId] = useState<number>(0);
  const [pack, setPack] = useState<Pack>();
  const [game, setGame] = useState<Game>();
  const [config, setConfig] = useState<Config>();
  const [starterpack, setStarterpack] = useState<Starterpack>();
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  // Initialize Torii client
  useEffect(() => {
    const getClient = async () => {
      const toriiUrl = import.meta.env.VITE_SEPOLIA_TORII_URL;
      const client = await new torii.ToriiClient({
        toriiUrl: toriiUrl,
        worldAddress: "0x0",
      });
      setClient(client);
    };
    getClient();
  }, []);

  // Handler for entity updates (packs)
  const onEntityUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${CONFIG}`]) {
          const model = entity.models[
            `${NAMESPACE}-${CONFIG}`
          ] as unknown as RawConfig;
          setConfig(Config.parse(model));
        }
        if (entity.models[`${NAMESPACE}-${STARTERPACK}`]) {
          const model = entity.models[
            `${NAMESPACE}-${STARTERPACK}`
          ] as unknown as RawStarterpack;
          setStarterpack(Starterpack.parse(model));
        }
        if (entity.models[`${NAMESPACE}-${PACK}`]) {
          const model = entity.models[
            `${NAMESPACE}-${PACK}`
          ] as unknown as RawPack;
          setPack(Pack.parse(model));
        }
        if (entity.models[`${NAMESPACE}-${GAME}`]) {
          const model = entity.models[
            `${NAMESPACE}-${GAME}`
          ] as unknown as RawGame;
          setGame(Game.parse(model));
        }
      });
    },
    [],
  );

  // Refresh function to fetch and subscribe to data
  const refreshEntities = useCallback(async () => {
    if (!client || !account) return;

    // Cancel existing subscriptions
    entitiesSubscriptionRef.current = null;

    // Create queries
    const query = getEntityQuery(NAMESPACE);

    // Fetch initial data
    await Promise.all([
      client
        .getEntities(query.build())
        .then((result) =>
          onEntityUpdate({ data: result.items, error: undefined }),
        ),
    ]);

    // Subscribe to entity and event updates
    client
      .onEntityUpdated(query.build().clause, [], onEntityUpdate)
      .then((response) => {
        entitiesSubscriptionRef.current = response;
      });
  }, [client, account, onEntityUpdate]);

  // Refresh function to fetch and subscribe to data
  const refreshPack = useCallback(async () => {
    if (!client || !account || !packId || !gameId) return;

    // Cancel existing subscriptions
    packSubscriptionRef.current = null;

    // Fetch initial data
    const query = getPackQuery(packId).build();
    await client
      .getEntities(query)
      .then((result) =>
        onEntityUpdate({ data: result.items, error: undefined }),
      );

    // Subscribe to entity and event updates
    client
      .onEntityUpdated(query.clause, [], onEntityUpdate)
      .then((response) => {
        entitiesSubscriptionRef.current = response;
      });
  }, [client, account, onEntityUpdate, packId, gameId]);

  // Refresh function to fetch and subscribe to data
  const refreshGame = useCallback(async () => {
    if (!client || !account || !packId || !gameId) return;

    // Cancel existing subscriptions
    gameSubscriptionRef.current = null;

    // Fetch initial data
    const query = getGameQuery(packId, gameId).build();
    await client
      .getEntities(query)
      .then((result) =>
        onEntityUpdate({ data: result.items, error: undefined }),
      );

    // Subscribe to entity and event updates
    client
      .onEntityUpdated(query.clause, [], onEntityUpdate)
      .then((response) => {
        gameSubscriptionRef.current = response;
      });
  }, [client, account, onEntityUpdate, packId, gameId]);

  const refresh = useCallback(async () => {
    await refreshEntities();
    await refreshPack();
    await refreshGame();
  }, [refreshEntities, refreshPack, refreshGame]);

  // Initial fetch and subscription setup
  useEffect(() => {
    if (
      entitiesSubscriptionRef.current &&
      !!pack &&
      pack.id === packId &&
      !!game &&
      game.id === gameId
    )
      return;
    setStatus("loading");
    refresh()
      .then(() => {
        setStatus("success");
      })
      .catch((error: Error) => {
        console.error(error);
        setStatus("error");
      });

    return () => {
      if (entitiesSubscriptionRef.current) {
        entitiesSubscriptionRef.current.cancel();
      }
      if (packSubscriptionRef.current) {
        packSubscriptionRef.current.cancel();
      }
      if (gameSubscriptionRef.current) {
        gameSubscriptionRef.current.cancel();
      }
    };
  }, [refresh, packId, gameId, pack, game]);

  const value: EntitiesContextType = {
    client,
    pack,
    game,
    starterpack,
    config,
    status,
    refresh,
    setGameId,
    setPackId,
  };

  return (
    <EntitiesContext.Provider value={value}>
      {children}
    </EntitiesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEntitiesContext() {
  const context = useContext(EntitiesContext);
  if (!context) {
    throw new Error(
      "useEntitiesContext must be used within a EntitiesProvider",
    );
  }
  return context;
}
