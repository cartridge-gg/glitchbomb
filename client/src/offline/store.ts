import { useSyncExternalStore } from "react";
import { Game, Orb, OrbPulled, PLDataPoint } from "@/models";
import { isMobile } from "@/utils/mobile";
import { DEFAULT_MOONROCKS } from "./constants";
import {
  buyFromShop,
  cashOut,
  createGame as createGameEngine,
  enterShop,
  exitShop,
  pullOrbs,
  startGame,
} from "./engine";
import { createSeed } from "./random";
import type {
  OfflineGame,
  OfflineOrbPulled,
  OfflinePLDataPoint,
  OfflineState,
} from "./types";

const STORAGE_KEY = "glitchbomb-practice-games";
const MAX_STORED_GAMES = 50;

type Listener = () => void;

const listeners = new Set<Listener>();
let state: OfflineState = loadState();

function defaultState(): OfflineState {
  return {
    version: 1,
    nextGameId: 1,
    games: {},
    pulls: [],
    plDataPoints: [],
  };
}

function loadState(): OfflineState {
  if (!isMobile) return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return JSON.parse(raw) as OfflineState;
  } catch {
    return defaultState();
  }
}

function saveState(s: OfflineState) {
  if (!isMobile) return;
  try {
    // Trim to MAX_STORED_GAMES most recent games
    const gameIds = Object.keys(s.games)
      .map(Number)
      .sort((a, b) => b - a)
      .slice(0, MAX_STORED_GAMES);
    const gameIdSet = new Set(gameIds);
    const trimmed: OfflineState = {
      ...s,
      games: Object.fromEntries(
        Object.entries(s.games).filter(([id]) => gameIdSet.has(Number(id))),
      ),
      pulls: s.pulls.filter((p) => gameIdSet.has(p.game_id)),
      plDataPoints: s.plDataPoints.filter((p) => gameIdSet.has(p.game_id)),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

function setState(updater: (prev: OfflineState) => OfflineState) {
  state = updater(state);
  saveState(state);
  for (const listener of listeners) {
    listener();
  }
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

/** Check if a game exists in the in-memory practice store. */
export function isPracticeGame(gameId: number): boolean {
  return !!state.games[gameId];
}

function ensureGame(prev: OfflineState, gameId: number): OfflineGame {
  const game = prev.games[gameId];
  if (!game) throw new Error("Game not found");
  return game;
}

function nextPlId(prev: OfflineState, gameId: number): number {
  const existing = prev.plDataPoints.filter((p) => p.game_id === gameId);
  if (existing.length === 0) return 0;
  return Math.max(...existing.map((p) => p.id)) + 1;
}

export function createOfflineGame(): number {
  let createdId = 0;
  setState((prev) => {
    const id = prev.nextGameId;
    createdId = id;
    const game = createGameEngine(id, DEFAULT_MOONROCKS, 1);

    // Start the game immediately (fill bag, deduct entry cost)
    const { game: started, cost } = startGame(game);
    started.moonrocks = game.moonrocks - cost;

    const plBaseId = nextPlId(prev, id);
    const plStart: OfflinePLDataPoint = {
      game_id: id,
      id: plBaseId,
      potential_moonrocks: game.moonrocks,
      orb: 0,
    };
    const plAfter: OfflinePLDataPoint = {
      game_id: id,
      id: plBaseId + 1,
      potential_moonrocks: started.moonrocks + started.points,
      orb: 0,
    };

    return {
      ...prev,
      nextGameId: id + 1,
      games: { ...prev.games, [id]: started },
      plDataPoints: [...prev.plDataPoints, plStart, plAfter],
    };
  });
  return createdId;
}

export function pull(gameId: number): boolean {
  try {
    setState((prev) => {
      const game = ensureGame(prev, gameId);
      const seed = createSeed();
      const { game: nextGame, orbs, earnings } = pullOrbs(game, seed);

      if (earnings) {
        nextGame.moonrocks = game.moonrocks + earnings;
      } else {
        nextGame.moonrocks = game.moonrocks;
      }

      const potential = nextGame.moonrocks + nextGame.points;
      const plBaseId = nextPlId(prev, gameId);

      const pulls: OfflineOrbPulled[] = [];
      const plPoints: OfflinePLDataPoint[] = [];

      orbs.forEach((orbId, index) => {
        pulls.push({
          game_id: gameId,
          id: nextGame.pull_count - index,
          orb: orbId,
          potential_moonrocks: potential,
        });
        plPoints.push({
          game_id: gameId,
          id: plBaseId + index,
          potential_moonrocks: potential,
          orb: orbId,
        });
      });

      return {
        ...prev,
        games: { ...prev.games, [gameId]: nextGame },
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

export function cashOutAction(gameId: number): boolean {
  try {
    setState((prev) => {
      const game = ensureGame(prev, gameId);
      const { game: nextGame } = cashOut(game);

      return {
        ...prev,
        games: { ...prev.games, [gameId]: nextGame },
      };
    });
    return true;
  } catch (error) {
    console.error("[offline] cash out failed", error);
    return false;
  }
}

export function enter(gameId: number): boolean {
  try {
    setState((prev) => {
      const game = ensureGame(prev, gameId);
      const seed = createSeed();
      const { game: nextGame } = enterShop(game, seed);

      const plId = nextPlId(prev, gameId);
      const potential = nextGame.moonrocks + nextGame.points;
      const plPoint: OfflinePLDataPoint = {
        game_id: gameId,
        id: plId,
        potential_moonrocks: potential,
        orb: 0,
      };

      return {
        ...prev,
        games: { ...prev.games, [gameId]: nextGame },
        plDataPoints: [...prev.plDataPoints, plPoint],
      };
    });
    return true;
  } catch (error) {
    console.error("[offline] enter failed", error);
    return false;
  }
}

export function buy(gameId: number, indices: number[]): boolean {
  try {
    setState((prev) => {
      const game = ensureGame(prev, gameId);
      const nextGame = buyFromShop(game, indices);
      nextGame.moonrocks = game.moonrocks;
      return {
        ...prev,
        games: { ...prev.games, [gameId]: nextGame },
      };
    });
    return true;
  } catch (error) {
    console.error("[offline] buy failed", error);
    return false;
  }
}

export function exit(gameId: number): boolean {
  try {
    setState((prev) => {
      const game = ensureGame(prev, gameId);
      const { game: nextGame } = exitShop(game);

      return {
        ...prev,
        games: { ...prev.games, [gameId]: nextGame },
      };
    });
    return true;
  } catch (error) {
    console.error("[offline] exit failed", error);
    return false;
  }
}

export function buyAndExit(gameId: number, indices: number[]): boolean {
  if (!indices.length) {
    return exit(gameId);
  }
  if (!buy(gameId, indices)) return false;
  return exit(gameId);
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

export function selectGame(source: OfflineState, gameId: number) {
  const game = source.games[gameId];
  if (!game) return undefined;
  return toGameModel(game);
}

export function selectPulls(source: OfflineState, gameId: number): OrbPulled[] {
  return source.pulls
    .filter((pull) => pull.game_id === gameId)
    .map(
      (pull) =>
        new OrbPulled(
          pull.game_id,
          pull.id,
          Orb.from(pull.orb),
          pull.potential_moonrocks,
        ),
    );
}

export function selectPLDataPoints(
  source: OfflineState,
  gameId: number,
): PLDataPoint[] {
  return source.plDataPoints
    .filter((point) => point.game_id === gameId)
    .map(
      (point) =>
        new PLDataPoint(
          BigInt(point.game_id),
          point.id,
          point.potential_moonrocks,
          point.orb,
        ),
    );
}

function toGameModel(game: OfflineGame): Game {
  const bag = game.bag.map((orb) => Orb.from(orb));
  const discards = normalizeDiscards(game.discards, bag.length);
  const shop = game.shop ? game.shop.orbs.map((orb) => Orb.from(orb)) : [];
  const pullables = bag.filter((_orb, index) => !discards[index]);

  return new Game(
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
    game.moonrocks,
    game.stake,
    game.created_at,
  );
}

function normalizeDiscards(discards: boolean[], length: number): boolean[] {
  if (discards.length >= length) return discards.slice(0, length);
  return [...discards, ...new Array(length - discards.length).fill(false)];
}
