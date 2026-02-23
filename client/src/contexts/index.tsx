import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import * as torii from "@dojoengine/torii-wasm";
import { useAccount } from "@starknet-react/core";
import {
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { NAMESPACE } from "@/constants";
import {
  CONFIG,
  Config,
  GAME,
  Game,
  type RawConfig,
  type RawGame,
  type RawStarterpack,
  STARTERPACK,
  Starterpack,
} from "@/models";
import { useOfflineMode } from "@/offline/mode";
import { selectGame, useOfflineStore } from "@/offline/store";
import { EntitiesContext, type EntitiesContextType } from "./entities-context";

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

const getGameQuery = (gameId: number) => {
  const game: `${string}-${string}` = `${NAMESPACE}-${GAME}`;
  const clauses = new ClauseBuilder().keys(
    [game],
    [`0x${gameId.toString(16).padStart(16, "0")}`],
    "FixedLen",
  );
  return new ToriiQueryBuilder()
    .withClause(clauses.build())
    .includeHashedKeys();
};

function useOnchainEntitiesValue(enabled: boolean): EntitiesContextType {
  const { address: accountAddress } = useAccount();
  const [client, setClient] = useState<torii.ToriiClient>();
  const entitiesSubscriptionRef = useRef<torii.Subscription | null>(null);
  const gameSubscriptionRef = useRef<torii.Subscription | null>(null);
  const cancelSubscription = useCallback(
    (ref: MutableRefObject<torii.Subscription | null>, label: string) => {
      if (!ref.current) return;
      try {
        ref.current.cancel();
      } catch (error) {
        console.warn(`[EntitiesProvider] ${label} cancel failed`, error);
      } finally {
        ref.current = null;
      }
    },
    [],
  );
  const [gameId, setGameIdState] = useState<number>(0);
  const [game, setGame] = useState<Game>();

  const setGameId = useCallback(
    (id: number) => {
      if (id !== gameId) {
        // Cancel existing game subscription when switching games
        cancelSubscription(gameSubscriptionRef, "game");
        setGame(undefined);
      }
      setGameIdState(id);
    },
    [gameId, cancelSubscription],
  );

  const [config, setConfig] = useState<Config>();
  const [starterpack, setStarterpack] = useState<Starterpack>();
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading",
  );

  // Initialize Torii client
  useEffect(() => {
    if (!enabled || client) return;
    const getClient = async () => {
      const toriiUrl = import.meta.env.VITE_SEPOLIA_TORII_URL;
      const nextClient = await new torii.ToriiClient({
        toriiUrl: toriiUrl,
        worldAddress: "0x0",
      });
      setClient(nextClient);
    };
    getClient();
  }, [enabled, client]);

  // Handler for entity updates
  const onEntityUpdate = useCallback(
    (data: SubscriptionCallbackArgs<torii.Entity[], Error>) => {
      if (!data || data.error) return;
      (data.data || [data] || []).forEach((entity) => {
        if (entity.models[`${NAMESPACE}-${CONFIG}`]) {
          const model = entity.models[
            `${NAMESPACE}-${CONFIG}`
          ] as unknown as RawConfig;
          const parsed = Config.parse(model);
          if (parsed) setConfig(parsed);
        }
        if (entity.models[`${NAMESPACE}-${STARTERPACK}`]) {
          const model = entity.models[
            `${NAMESPACE}-${STARTERPACK}`
          ] as unknown as RawStarterpack;
          const parsed = Starterpack.parse(model);
          if (parsed) setStarterpack(parsed);
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
    if (!enabled || !client || !accountAddress) return;

    // Cancel existing subscriptions
    cancelSubscription(entitiesSubscriptionRef, "entities");

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
  }, [enabled, client, accountAddress, onEntityUpdate, cancelSubscription]);

  // Refresh function to fetch and subscribe to game data
  const refreshGame = useCallback(async () => {
    if (!enabled || !client || !accountAddress || !gameId) return;

    // Cancel existing subscriptions
    cancelSubscription(gameSubscriptionRef, "game");

    // Fetch initial data
    const query = getGameQuery(gameId).build();
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
  }, [
    enabled,
    client,
    accountAddress,
    onEntityUpdate,
    gameId,
    cancelSubscription,
  ]);

  const refresh = useCallback(async () => {
    await refreshEntities();
    await refreshGame();
  }, [refreshEntities, refreshGame]);

  // Initial fetch and subscription setup
  useEffect(() => {
    if (!enabled) return;
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
      cancelSubscription(entitiesSubscriptionRef, "entities");
      cancelSubscription(gameSubscriptionRef, "game");
    };
  }, [enabled, refresh, cancelSubscription]);

  return {
    client,
    game,
    starterpack,
    config,
    status,
    refresh,
    setGameId,
  };
}

function useOfflineEntitiesValue(): EntitiesContextType {
  const offlineState = useOfflineStore();
  const [gameId, setGameIdState] = useState<number>(0);

  const game = useMemo(() => {
    if (!gameId) return undefined;
    return selectGame(offlineState, gameId);
  }, [offlineState, gameId]);

  const config = useMemo(() => new Config("0", "0x0", "0x0", "0x0"), []);
  const starterpack = useMemo(
    () => new Starterpack("0", true, 0, 0n, "0x0"),
    [],
  );

  const refresh = useCallback(async () => {}, []);

  const setGameId = useCallback((id: number) => {
    setGameIdState(id);
  }, []);

  return {
    game,
    starterpack,
    config,
    status: "success",
    refresh,
    setGameId,
  };
}

export function EntitiesProvider({ children }: { children: ReactNode }) {
  const offline = useOfflineMode();
  const onchainValue = useOnchainEntitiesValue(!offline);
  const offlineValue = useOfflineEntitiesValue();
  const value = offline ? offlineValue : onchainValue;

  return (
    <EntitiesContext.Provider value={value}>
      {children}
    </EntitiesContext.Provider>
  );
}
