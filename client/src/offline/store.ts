import { useSyncExternalStore } from "react";
import { DEFAULT_EXPIRATION } from "@/constants";
import { Game, Marker, Orb, OrbPulled } from "@/models";
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
  OfflineMarker,
  OfflineOrbPulled,
  OfflineState,
} from "./types";

type Listener = () => void;

const listeners = new Set<Listener>();
let state: OfflineState = defaultState();

// Marker id layout (mirrors contracts/src/models/game.cairo):
// every level owns a band of MARKER_LEVEL_BAND ids, lower half for pull
// markers (`pull_count_pre * 2 + orb_index`) and upper half offset by
// MARKER_LEVEL_OFFSET for level-transition markers.
const MARKER_LEVEL_BAND = 1024;
const MARKER_LEVEL_OFFSET = 512;

const pullMarkerId = (level: number, pullCountPre: number, orbIndex: number) =>
  level * MARKER_LEVEL_BAND + pullCountPre * 2 + orbIndex;

const levelMarkerId = (level: number, pullCount: number) =>
  level * MARKER_LEVEL_BAND + pullCount * 2 + MARKER_LEVEL_OFFSET;

function defaultState(): OfflineState {
  return {
    version: 1,
    nextGameId: 1,
    activeGameId: null,
    games: {},
    pulls: [],
    markers: [],
  };
}

function setState(updater: (prev: OfflineState) => OfflineState) {
  state = updater(state);
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

export function createOfflineGame(): number {
  let createdId = 0;
  setState((prev) => {
    const id = prev.nextGameId;
    createdId = id;
    const game = createGameEngine(id, DEFAULT_MOONROCKS, 1);

    const { game: started, cost } = startGame(game);
    started.moonrocks = game.moonrocks - cost;

    // Baseline marker (id=0) — see Game::level_marker_id contract notes.
    const baseline: OfflineMarker = {
      game_id: id,
      id: 0,
      potential_moonrocks: game.moonrocks,
      orb: 0,
    };

    return {
      ...prev,
      nextGameId: id + 1,
      activeGameId: id,
      games: { ...prev.games, [id]: started },
      markers: [...prev.markers, baseline],
    };
  });
  return createdId;
}

export function pull(gameId: number, forcedOrbId?: number): boolean {
  try {
    setState((prev) => {
      const game = ensureGame(prev, gameId);
      const seed = createSeed();
      const {
        game: nextGame,
        orbs,
        earnings,
      } = pullOrbs(game, seed, forcedOrbId);

      // Compute potential BEFORE applying moonrock earnings (matches contract)
      nextGame.moonrocks = game.moonrocks;
      const potential = nextGame.moonrocks + nextGame.points;

      // Apply moonrock earnings after capturing potential
      if (earnings) {
        nextGame.moonrocks = game.moonrocks + earnings;
      }

      const pullCountPre = nextGame.pull_count - orbs.length;

      const pulls: OfflineOrbPulled[] = [];
      const newMarkers: OfflineMarker[] = [];

      orbs.forEach((orbId, index) => {
        pulls.push({
          game_id: gameId,
          id: nextGame.pull_count - index,
          orb: orbId,
          potential_moonrocks: potential,
        });
        newMarkers.push({
          game_id: gameId,
          id: pullMarkerId(nextGame.level, pullCountPre, index),
          potential_moonrocks: potential,
          orb: orbId,
        });
      });

      return {
        ...prev,
        games: { ...prev.games, [gameId]: nextGame },
        pulls: [...prev.pulls, ...pulls],
        markers: [...prev.markers, ...newMarkers],
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

      // Level marker — emitted on the level the player just finished
      // (level_up happens during exit, not enter). See contract:
      // contracts/src/components/playable.cairo enter().
      const potential = nextGame.moonrocks + nextGame.points;
      const marker: OfflineMarker = {
        game_id: gameId,
        id: levelMarkerId(nextGame.level, nextGame.pull_count),
        potential_moonrocks: potential,
        orb: 0,
      };

      return {
        ...prev,
        games: { ...prev.games, [gameId]: nextGame },
        markers: [...prev.markers, marker],
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

export function selectMarkers(source: OfflineState, gameId: number): Marker[] {
  return source.markers
    .filter((marker) => marker.game_id === gameId)
    .map(
      (marker) =>
        new Marker(
          BigInt(marker.game_id),
          marker.id,
          marker.potential_moonrocks,
          marker.orb,
        ),
    );
}

function toGameModel(game: OfflineGame): Game {
  const bag = game.bag.map((orb) => Orb.from(orb));
  const discards = normalizeDiscards(game.discards, bag.length);
  const shop = game.shop ? game.shop.orbs.map((orb) => Orb.from(orb)) : [];
  const pullables = bag.filter((_orb, index) => !discards[index]);
  const expiration =
    game.created_at > 0 ? game.created_at + DEFAULT_EXPIRATION : 0;

  return new Game(
    game.id,
    false,
    game.level,
    game.health,
    game.immunity,
    game.curses,
    game.pull_count,
    game.points,
    game.milestone,
    game.multiplier / 100,
    game.chips,
    game.moonrocks,
    game.over,
    expiration,
    discards,
    shop,
    game.stake,
    0n,
    0n,
    bag,
    0n,
    0n,
    game.purchaseCounts ?? [],
    pullables,
  );
}

function normalizeDiscards(discards: boolean[], length: number): boolean[] {
  if (discards.length >= length) return discards.slice(0, length);
  return [...discards, ...new Array(length - discards.length).fill(false)];
}
