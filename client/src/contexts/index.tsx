import {
  ClauseBuilder,
  type SubscriptionCallbackArgs,
  ToriiQueryBuilder,
} from "@dojoengine/sdk";
import * as torii from "@dojoengine/torii-wasm";
import { useAccount } from "@starknet-react/core";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NAMESPACE } from "@/constants";
import { useOfflineMode } from "@/offline/mode";
import { selectGame, useOfflineStore } from "@/offline/store";
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
  const account = useAccount();
  const [client, setClient] = useState<torii.ToriiClient>();
  const entitiesSubscriptionRef = useRef<torii.Subscription | null>(null);
  const packSubscriptionRef = useRef<torii.Subscription | null>(null);
  const gameSubscriptionRef = useRef<torii.Subscription | null>(null);
  const [packId, setPackIdState] = useState<number>(0);
  const [gameId, setGameIdState] = useState<number>(0);
  const [pack, setPack] = useState<Pack>();
  const [game, setGame] = useState<Game>();

  // Clear game state when IDs change to prevent stale data
  const setPackId = useCallback(
    (id: number) => {
      if (id !== packId) {
        // Cancel existing subscriptions when switching packs
        if (packSubscriptionRef.current) {
          packSubscriptionRef.current.cancel();
          packSubscriptionRef.current = null;
        }
        if (gameSubscriptionRef.current) {
          gameSubscriptionRef.current.cancel();
          gameSubscriptionRef.current = null;
        }
        setPack(undefined);
        setGame(undefined);
      }
      setPackIdState(id);
    },
    [packId],
  );

  const setGameId = useCallback(
    (id: number) => {
      if (id !== gameId) {
        // Cancel existing game subscription when switching games
        if (gameSubscriptionRef.current) {
          gameSubscriptionRef.current.cancel();
          gameSubscriptionRef.current = null;
        }
        setGame(undefined);
      }
      setGameIdState(id);
    },
    [gameId],
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
          if (parsed) setStarterpack(parsed);
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
    if (!enabled || !client || !account) return;

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
  }, [enabled, client, account, onEntityUpdate]);

  // Refresh function to fetch and subscribe to data
  const refreshPack = useCallback(async () => {
    if (!enabled || !client || !account || !packId || !gameId) return;

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
  }, [enabled, client, account, onEntityUpdate, packId, gameId]);

  // Refresh function to fetch and subscribe to data
  const refreshGame = useCallback(async () => {
    if (!enabled || !client || !account || !packId || !gameId) return;

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
  }, [enabled, client, account, onEntityUpdate, packId, gameId]);

  const refresh = useCallback(async () => {
    await refreshEntities();
    await refreshPack();
    await refreshGame();
  }, [refreshEntities, refreshPack, refreshGame]);

  // Initial fetch and subscription setup
  useEffect(() => {
    if (!enabled) return;
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
  }, [enabled, refresh, packId, gameId, pack, game]);

  return {
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
}

function useOfflineEntitiesValue(): EntitiesContextType {
  const offlineState = useOfflineStore();
  const [packId, setPackIdState] = useState<number>(0);
  const [gameId, setGameIdState] = useState<number>(0);

  const pack = useMemo(() => {
    const raw = offlineState.packs[packId];
    return raw ? new Pack(raw.id, raw.game_count, raw.moonrocks) : undefined;
  }, [offlineState.packs, packId]);

  const game = useMemo(() => {
    if (!packId || !gameId) return undefined;
    return selectGame(offlineState, packId, gameId);
  }, [offlineState, packId, gameId]);

  const config = useMemo(() => new Config("0", "0x0", "0x0", "0x0"), []);
  const starterpack = useMemo(
    () => new Starterpack("0", true, 0, 0n, "0x0"),
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
    starterpack,
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
