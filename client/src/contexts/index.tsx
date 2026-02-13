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
  PACK,
  Pack,
  type RawConfig,
  type RawGame,
  type RawPack,
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

function useOnchainEntitiesValue(enabled: boolean): EntitiesContextType {
  const { address: accountAddress } = useAccount();
  const [client, setClient] = useState<torii.ToriiClient>();
  const entitiesSubscriptionRef = useRef<torii.Subscription | null>(null);
  const packSubscriptionRef = useRef<torii.Subscription | null>(null);
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
  const [packId, setPackIdState] = useState<number>(0);
  const [gameId, setGameIdState] = useState<number>(0);
  const [pack, setPack] = useState<Pack>();
  const [game, setGame] = useState<Game>();

  // Clear game state when IDs change to prevent stale data
  const setPackId = useCallback(
    (id: number) => {
      if (id !== packId) {
        // Cancel existing subscriptions when switching packs
        cancelSubscription(packSubscriptionRef, "pack");
        cancelSubscription(gameSubscriptionRef, "game");
        setPack(undefined);
        setGame(undefined);
      }
      setPackIdState(id);
    },
    [packId, cancelSubscription],
  );

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
  const [starterpacks, setStarterpacks] = useState<Starterpack[]>([]);
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

  // Handler for entity updates (packs)
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
          if (parsed) {
            setStarterpacks((prev) => {
              const filtered = prev.filter((sp) => sp.id !== parsed.id);
              return [...filtered, parsed].sort(
                (a, b) => Number(a.price) - Number(b.price),
              );
            });
          }
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

  // Refresh function to fetch and subscribe to data
  const refreshPack = useCallback(async () => {
    if (!enabled || !client || !accountAddress || !packId || !gameId) return;

    // Cancel existing subscriptions
    cancelSubscription(packSubscriptionRef, "pack");

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
        packSubscriptionRef.current = response;
      });
  }, [
    enabled,
    client,
    accountAddress,
    onEntityUpdate,
    packId,
    gameId,
    cancelSubscription,
  ]);

  // Refresh function to fetch and subscribe to data
  const refreshGame = useCallback(async () => {
    if (!enabled || !client || !accountAddress || !packId || !gameId) return;

    // Cancel existing subscriptions
    cancelSubscription(gameSubscriptionRef, "game");

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
  }, [
    enabled,
    client,
    accountAddress,
    onEntityUpdate,
    packId,
    gameId,
    cancelSubscription,
  ]);

  const refresh = useCallback(async () => {
    await refreshEntities();
    await refreshPack();
    await refreshGame();
  }, [refreshEntities, refreshPack, refreshGame]);

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
      cancelSubscription(packSubscriptionRef, "pack");
      cancelSubscription(gameSubscriptionRef, "game");
    };
  }, [enabled, refresh, cancelSubscription]);

  return {
    client,
    pack,
    game,
    starterpacks,
    config,
    status,
    refresh,
    setGameId,
    setPackId,
  };
}

function useOfflineEntitiesValue(): EntitiesContextType {
  const offlineState = useOfflineStore();
  const [packId, setPackIdState] = useState<number>(0);
  const [gameId, setGameIdState] = useState<number>(0);

  const pack = useMemo(() => {
    const raw = offlineState.packs[packId];
    return raw ? new Pack(raw.id, raw.game_count, raw.moonrocks, raw.entry_cost ?? 2, raw.created_at ?? 0) : undefined;
  }, [offlineState.packs, packId]);

  const game = useMemo(() => {
    if (!packId || !gameId) return undefined;
    return selectGame(offlineState, packId, gameId);
  }, [offlineState, packId, gameId]);

  const config = useMemo(() => new Config("0", "0x0", "0x0", "0x0"), []);
  const starterpacks = useMemo(
    () => [new Starterpack("0", true, 0, 2_000_000n, "0x0")],
    [],
  );

  const refresh = useCallback(async () => {}, []);

  const setPackId = useCallback(
    (id: number) => {
      if (id !== packId) {
        setGameIdState(0);
      }
      setPackIdState(id);
    },
    [packId],
  );

  const setGameId = useCallback((id: number) => {
    setGameIdState(id);
  }, []);

  return {
    pack,
    game,
    starterpacks,
    config,
    status: "success",
    refresh,
    setGameId,
    setPackId,
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
