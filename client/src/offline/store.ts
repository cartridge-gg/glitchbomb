import { useSyncExternalStore } from "react";
import { cashOutPayout } from "@/helpers/payout";
import { Game, Orb, OrbPulled, Pack, PLDataPoint } from "@/models";
import { DEFAULT_GAMES_COUNT, DEFAULT_MOONROCKS } from "./constants";
import {
  buyFromShop,
  cashOut,
  createGame,
  enterShop,
  exitShop,
  pullOrbs,
  startGame,
} from "./engine";
import { createSeed } from "./random";
import type {
  OfflineGame,
  OfflineOrbPulled,
  OfflinePack,
  OfflinePLDataPoint,
  OfflineState,
} from "./types";

const STORAGE_KEY = "glitchbomb_offline_state_v1";
const STATE_VERSION = 1;

type Listener = () => void;

const listeners = new Set<Listener>();
let state: OfflineState = loadState();

function loadState(): OfflineState {
  if (typeof window === "undefined") {
    return defaultState();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as OfflineState;
    if (!parsed || parsed.version !== STATE_VERSION) return defaultState();
    return parsed;
  } catch {
    return defaultState();
  }
}

function defaultState(): OfflineState {
  const pack: OfflinePack = {
    id: 1,
    game_count: 0,
    moonrocks: DEFAULT_MOONROCKS,
  };
  return {
    version: STATE_VERSION,
    nextPackId: 2,
    packs: { [pack.id]: pack },
    games: {},
    pulls: [],
    plDataPoints: [],
  };
}

function persist(nextState: OfflineState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    // Ignore persistence errors in private mode or full storage.
  }
}

function setState(updater: (prev: OfflineState) => OfflineState) {
  const next = updater(state);
  state = next;
  persist(state);
  listeners.forEach((listener) => {
    listener();
  });
}

export function getOfflineState(): OfflineState {
  return state;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useOfflineStore(): OfflineState {
  return useSyncExternalStore(subscribe, getOfflineState, getOfflineState);
}

function keyFor(packId: number, gameId: number) {
  return `${packId}-${gameId}`;
}

function ensurePack(prev: OfflineState, packId: number): OfflinePack {
  const pack = prev.packs[packId];
  if (!pack) throw new Error("Pack not found");
  return pack;
}

function ensureGame(
  prev: OfflineState,
  packId: number,
  gameId: number,
): OfflineGame {
  const game = prev.games[keyFor(packId, gameId)];
  if (!game) throw new Error("Game not found");
  return game;
}

export function createPack(): number {
  let createdId = 0;
  setState((prev) => {
    const id = prev.nextPackId;
    createdId = id;
    const pack: OfflinePack = {
      id,
      game_count: 0,
      moonrocks: DEFAULT_MOONROCKS,
      created_at: Math.floor(Date.now() / 1000),
    };
    return {
      ...prev,
      nextPackId: id + 1,
      packs: { ...prev.packs, [id]: pack },
    };
  });
  return createdId;
}

export function start(packId: number): boolean {
  try {
    setState((prev) => {
      const pack = ensurePack(prev, packId);
      if (pack.game_count >= DEFAULT_GAMES_COUNT) {
        throw new Error("Pack: is over");
      }
      if (pack.game_count > 0) {
        const lastGame = prev.games[keyFor(packId, pack.game_count)];
        if (lastGame && !lastGame.over) {
          throw new Error("Game: not over");
        }
      }

      const gameId = pack.game_count + 1;
      const game = createGame(packId, gameId);
      const { game: started, cost } = startGame(game);

      const beforeMoonrocks = pack.moonrocks;
      if (beforeMoonrocks < cost) {
        throw new Error("Pack: not enough moonrocks");
      }
      const updatedPack: OfflinePack = {
        ...pack,
        game_count: gameId,
        moonrocks: pack.moonrocks - cost,
      };

      const plStart: OfflinePLDataPoint = {
        pack_id: packId,
        game_id: gameId,
        id: 0,
        potential_moonrocks: beforeMoonrocks,
        orb: 0,
      };
      const plAfter: OfflinePLDataPoint = {
        pack_id: packId,
        game_id: gameId,
        id: 1,
        potential_moonrocks:
          updatedPack.moonrocks + cashOutPayout(started.points),
        orb: 0,
      };

      return {
        ...prev,
        packs: { ...prev.packs, [packId]: updatedPack },
        games: { ...prev.games, [keyFor(packId, gameId)]: started },
        plDataPoints: [...prev.plDataPoints, plStart, plAfter],
      };
    });
    return true;
  } catch (error) {
    console.error("[offline] start failed", error);
    return false;
  }
}

export function pull(packId: number, gameId: number): boolean {
  try {
    setState((prev) => {
      const pack = ensurePack(prev, packId);
      const game = ensureGame(prev, packId, gameId);
      const seed = createSeed();
      const { game: nextGame, orbs, earnings } = pullOrbs(game, seed);

      const potential = pack.moonrocks + cashOutPayout(nextGame.points);
      const previousCount = nextGame.pull_count - orbs.length;
      const baseId = 2 + previousCount * 2;

      const pulls: OfflineOrbPulled[] = [];
      const plPoints: OfflinePLDataPoint[] = [];

      orbs.forEach((orbId, index) => {
        pulls.push({
          pack_id: packId,
          game_id: gameId,
          id: nextGame.pull_count - index,
          orb: orbId,
          potential_moonrocks: potential,
        });
        plPoints.push({
          pack_id: packId,
          game_id: gameId,
          id: baseId + index,
          potential_moonrocks: potential,
          orb: orbId,
        });
      });

      const updatedPack: OfflinePack = earnings
        ? { ...pack, moonrocks: pack.moonrocks + earnings }
        : pack;

      return {
        ...prev,
        packs: { ...prev.packs, [packId]: updatedPack },
        games: { ...prev.games, [keyFor(packId, gameId)]: nextGame },
        pulls: [...prev.pulls, ...pulls],
        plDataPoints: [...prev.plDataPoints, ...plPoints],
      };
    });
    return true;
  } catch (error) {
    console.error("[offline] pull failed", error);
    return false;
  }
}

export function cashOutAction(packId: number, gameId: number): boolean {
  try {
    setState((prev) => {
      const pack = ensurePack(prev, packId);
      const game = ensureGame(prev, packId, gameId);
      const { game: nextGame, earnings } = cashOut(game);
      const updatedPack: OfflinePack = earnings
        ? { ...pack, moonrocks: pack.moonrocks + earnings }
        : pack;

      return {
        ...prev,
        packs: { ...prev.packs, [packId]: updatedPack },
        games: { ...prev.games, [keyFor(packId, gameId)]: nextGame },
      };
    });
    return true;
  } catch (error) {
    console.error("[offline] cash out failed", error);
    return false;
  }
}

export function enter(packId: number, gameId: number): boolean {
  try {
    setState((prev) => {
      const game = ensureGame(prev, packId, gameId);
      const seed = createSeed();
      const { game: nextGame } = enterShop(game, seed);
      return {
        ...prev,
        games: { ...prev.games, [keyFor(packId, gameId)]: nextGame },
      };
    });
    return true;
  } catch (error) {
    console.error("[offline] enter failed", error);
    return false;
  }
}

export function buy(
  packId: number,
  gameId: number,
  indices: number[],
): boolean {
  try {
    setState((prev) => {
      const game = ensureGame(prev, packId, gameId);
      const nextGame = buyFromShop(game, indices);
      return {
        ...prev,
        games: { ...prev.games, [keyFor(packId, gameId)]: nextGame },
      };
    });
    return true;
  } catch (error) {
    console.error("[offline] buy failed", error);
    return false;
  }
}

export function exit(packId: number, gameId: number): boolean {
  try {
    setState((prev) => {
      const pack = ensurePack(prev, packId);
      const game = ensureGame(prev, packId, gameId);
      const { game: nextGame, cost } = exitShop(game);

      if (pack.moonrocks < cost) {
        throw new Error("Pack: not enough moonrocks");
      }

      const updatedPack: OfflinePack = {
        ...pack,
        moonrocks: pack.moonrocks - cost,
      };

      const plId = 2 + nextGame.pull_count * 2 + (nextGame.level - 1);
      const potential = updatedPack.moonrocks + cashOutPayout(nextGame.points);
      const plPoint: OfflinePLDataPoint = {
        pack_id: packId,
        game_id: gameId,
        id: plId,
        potential_moonrocks: potential,
        orb: 0,
      };

      return {
        ...prev,
        packs: { ...prev.packs, [packId]: updatedPack },
        games: { ...prev.games, [keyFor(packId, gameId)]: nextGame },
        plDataPoints: [...prev.plDataPoints, plPoint],
      };
    });
    return true;
  } catch (error) {
    console.error("[offline] exit failed", error);
    return false;
  }
}

export function buyAndExit(
  packId: number,
  gameId: number,
  indices: number[],
): boolean {
  if (!indices.length) {
    return exit(packId, gameId);
  }
  if (!buy(packId, gameId, indices)) return false;
  return exit(packId, gameId);
}

export function refresh(): boolean {
  console.warn("[offline] refresh disabled");
  return false;
}

export function burn(): boolean {
  console.warn("[offline] burn disabled");
  return false;
}

export function resetOfflineState() {
  setState(() => defaultState());
}

export function selectPacks(source: OfflineState = state): Pack[] {
  return Object.values(source.packs).map(
    (pack) => new Pack(pack.id, pack.game_count, pack.moonrocks, pack.entry_cost ?? 2, pack.created_at ?? 0),
  );
}

export function selectGame(
  source: OfflineState,
  packId: number,
  gameId: number,
) {
  const game = source.games[keyFor(packId, gameId)];
  if (!game) return undefined;
  return toGameModel(game);
}

export function selectPulls(
  source: OfflineState,
  packId: number,
  gameId: number,
): OrbPulled[] {
  return source.pulls
    .filter((pull) => pull.pack_id === packId && pull.game_id === gameId)
    .map(
      (pull) =>
        new OrbPulled(
          pull.pack_id,
          pull.game_id,
          pull.id,
          Orb.from(pull.orb),
          pull.potential_moonrocks,
        ),
    );
}

export function selectPLDataPoints(
  source: OfflineState,
  packId: number,
  gameId: number,
): PLDataPoint[] {
  return source.plDataPoints
    .filter((point) => point.pack_id === packId && point.game_id === gameId)
    .map(
      (point) =>
        new PLDataPoint(
          BigInt(point.pack_id),
          point.game_id,
          point.id,
          point.potential_moonrocks,
          point.orb,
        ),
    );
}

export function selectTotalMoonrocks(source: OfflineState = state): number {
  return Object.values(source.packs).reduce(
    (total, pack) => total + pack.moonrocks,
    0,
  );
}

function toGameModel(game: OfflineGame): Game {
  const bag = game.bag.map((orb) => Orb.from(orb));
  const discards = normalizeDiscards(game.discards, bag.length);
  const shop = game.shop ? game.shop.orbs.map((orb) => Orb.from(orb)) : [];
  const pullables = bag.filter((_orb, index) => !discards[index]);

  return new Game(
    game.pack_id,
    game.id,
    game.over,
    game.level,
    game.health,
    game.immunity,
    game.curses,
    game.pull_count,
    game.points,
    game.milestone,
    game.multiplier / 100,
    game.chips,
    discards,
    bag,
    shop,
    pullables,
  );
}

function normalizeDiscards(discards: boolean[], length: number): boolean[] {
  if (discards.length >= length) return discards.slice(0, length);
  return [...discards, ...new Array(length - discards.length).fill(false)];
}
