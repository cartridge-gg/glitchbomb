import { cashOutPayout } from "@/helpers/payout";
import { Orb } from "@/models/orb";
import {
  BASE_MULTIPLIER,
  CURSE_DEMULTIPLIER,
  CURSE_DOUBLE_DRAW,
  DEFAULT_LEVEL,
  MAX_CAPACITY,
  MAX_HEALTH,
  SUPP_MULTIPLIER,
} from "./constants";
import { milestoneCost, milestoneValue } from "./milestone";
import { initialOrbs, ORB_IDS, shopOrbs } from "./orbs";
import { Random } from "./random";
import type { OfflineGame, OfflineShopState } from "./types";

const orbFromId = (id: number) => Orb.from(id);

export function createGame(packId: number, gameId: number): OfflineGame {
  return {
    pack_id: packId,
    id: gameId,
    seed: "0",
    over: false,
    level: DEFAULT_LEVEL,
    health: MAX_HEALTH,
    immunity: 0,
    curses: 0,
    pull_count: 0,
    points: 0,
    milestone: milestoneValue(DEFAULT_LEVEL),
    multiplier: BASE_MULTIPLIER,
    chips: 0,
    discards: [],
    bag: [],
    shop: null,
  };
}

export function cloneGame(game: OfflineGame): OfflineGame {
  return {
    ...game,
    discards: game.discards.slice(),
    bag: game.bag.slice(),
    shop: game.shop
      ? {
          orbs: game.shop.orbs.slice(),
          refreshUsed: game.shop.refreshUsed,
          burnUsed: game.shop.burnUsed,
          purchaseCounts: game.shop.purchaseCounts.slice(),
        }
      : null,
  };
}

export function startGame(game: OfflineGame): {
  game: OfflineGame;
  cost: number;
} {
  const next = cloneGame(game);
  next.bag = initialOrbs();
  next.discards = next.bag.map(() => false);
  const cost = milestoneCost(next.level);
  return { game: next, cost };
}

export function cashOut(game: OfflineGame): {
  game: OfflineGame;
  earnings: number;
} {
  assertNotOver(game);
  assertNotInShop(game);
  const next = cloneGame(game);
  const earnings = cashOutPayout(next.points);
  next.points = 0;
  next.over = true;
  return { game: next, earnings };
}

export function enterShop(
  game: OfflineGame,
  seed: bigint,
): { game: OfflineGame; shop: OfflineShopState } {
  assertNotOver(game);
  assertNotInShop(game);
  assertCompleted(game);

  const next = cloneGame(game);
  const orbs = shopOrbs(seed);
  next.shop = {
    orbs,
    refreshUsed: false,
    burnUsed: false,
    purchaseCounts: new Array(ORB_IDS.StickyBomb + 1).fill(0),
  };
  next.chips += next.points;
  next.points = 0;
  return { game: next, shop: next.shop };
}

export function buyFromShop(game: OfflineGame, indices: number[]): OfflineGame {
  assertNotOver(game);
  assertInShop(game);

  const next = cloneGame(game);
  const shop = next.shop as OfflineShopState;

  indices.forEach((index) => {
    if (index < 0 || index >= shop.orbs.length) {
      throw new Error("Game: index out of range");
    }
    const orbId = shop.orbs[index];
    const baseCost = orbFromId(orbId).cost();
    const purchaseCount = shop.purchaseCounts[orbId] ?? 0;
    const multiplier = BASE_MULTIPLIER + purchaseCount * SUPP_MULTIPLIER;
    const cost = Math.floor(
      (baseCost * multiplier + BASE_MULTIPLIER - 1) / BASE_MULTIPLIER,
    );

    if (next.chips < cost) {
      throw new Error("Game: cannot afford");
    }
    if (next.bag.length >= MAX_CAPACITY) {
      throw new Error("Game: bag full");
    }

    next.chips -= cost;
    shop.purchaseCounts[orbId] = purchaseCount + 1;
    next.bag.push(orbId);
    next.discards.push(false);
  });

  return next;
}

export function exitShop(game: OfflineGame): {
  game: OfflineGame;
  cost: number;
} {
  assertNotOver(game);
  assertInShop(game);

  const next = cloneGame(game);
  next.level += 1;
  next.milestone = milestoneValue(next.level);
  next.health = MAX_HEALTH;
  next.shop = null;
  next.multiplier = BASE_MULTIPLIER;
  next.discards = next.bag.map(() => false);

  applyLevelCurse(next);

  const cost = milestoneCost(next.level);
  return { game: next, cost };
}

export function pullOrbs(
  game: OfflineGame,
  seed: bigint,
): { game: OfflineGame; orbs: number[]; earnings: number } {
  assertNotOver(game);
  assertNotCompleted(game);

  const next = cloneGame(game);
  next.seed = seed.toString();

  const stickyCount = countSticky(next.bag);
  const pullableCount = countPullable(next);
  if (pullableCount === stickyCount) {
    next.discards = next.bag.map(() => false);
  }

  const available = next.bag
    .map((_orb, index) => index)
    .filter((index) => !next.discards[index]);

  const drawCount = hasCurse(next.curses, CURSE_DOUBLE_DRAW) ? 2 : 1;
  const random = new Random(seed);
  const pulled: number[] = [];
  let totalEarnings = 0;

  while (pulled.length < drawCount && available.length > 0) {
    const pickIndex = random.nextInt(available.length);
    const bagIndex = available.splice(pickIndex, 1)[0] ?? 0;
    const orbId = next.bag[bagIndex] ?? ORB_IDS.None;

    if (orbId !== ORB_IDS.StickyBomb) {
      next.discards[bagIndex] = true;
    }

    totalEarnings += applyOrb(next, orbId);
    pulled.push(orbId);
    next.pull_count += 1;
  }

  if (next.health <= 0) {
    next.over = true;
  }

  return { game: next, orbs: pulled, earnings: totalEarnings };
}

function applyOrb(game: OfflineGame, orbId: number): number {
  switch (orbId) {
    case ORB_IDS.Bomb1:
      return explode(game, 1);
    case ORB_IDS.Bomb2:
      return explode(game, 2);
    case ORB_IDS.Bomb3:
      return explode(game, 3);
    case ORB_IDS.StickyBomb:
      return explode(game, 1);
    case ORB_IDS.Health1:
      heal(game, 1);
      return 0;
    case ORB_IDS.Health2:
      heal(game, 2);
      return 0;
    case ORB_IDS.Health3:
      heal(game, 3);
      return 0;
    case ORB_IDS.Multiplier50:
      boost(game, 50);
      return 0;
    case ORB_IDS.Multiplier100:
      boost(game, 100);
      return 0;
    case ORB_IDS.Multiplier150:
      boost(game, 150);
      return 0;
    case ORB_IDS.Point5:
      earnPoints(game, 5);
      return 0;
    case ORB_IDS.Point6:
      earnPoints(game, 6);
      return 0;
    case ORB_IDS.Point7:
      earnPoints(game, 7);
      return 0;
    case ORB_IDS.Point8:
      earnPoints(game, 8);
      return 0;
    case ORB_IDS.Point9:
      earnPoints(game, 9);
      return 0;
    case ORB_IDS.PointOrb1:
      earnPoints(game, countPullable(game));
      return 0;
    case ORB_IDS.PointBomb4:
      earnPoints(game, countPulledBombs(game) * 4);
      return 0;
    case ORB_IDS.Moonrock15:
      return 15;
    case ORB_IDS.Moonrock40:
      return 40;
    case ORB_IDS.Chips15:
      game.chips += 15;
      return 0;
    case ORB_IDS.CurseScoreDecrease:
      losePercent(game, 20);
      return 0;
    default:
      return 0;
  }
}

function explode(game: OfflineGame, damage: number): number {
  if (game.immunity > 0) {
    game.immunity -= 1;
    return 0;
  }
  game.health = Math.max(0, game.health - Math.min(damage, game.health));
  return 0;
}

function heal(game: OfflineGame, amount: number) {
  const missing = MAX_HEALTH - game.health;
  game.health += Math.min(amount, missing);
}

function boost(game: OfflineGame, multiplier: number) {
  const actualBoost = hasCurse(game.curses, CURSE_DEMULTIPLIER)
    ? Math.floor(multiplier / 2)
    : multiplier;
  game.multiplier += actualBoost;
}

function earnPoints(game: OfflineGame, amount: number) {
  const earned = Math.floor((game.multiplier * amount) / BASE_MULTIPLIER);
  game.points += earned;
}

function losePercent(game: OfflineGame, percent: number) {
  const loss = Math.floor((game.points * percent) / 100);
  game.points -= loss;
}

function countPullable(game: OfflineGame): number {
  let count = 0;
  for (let i = 0; i < game.bag.length; i += 1) {
    if (!game.discards[i]) count += 1;
  }
  return count;
}

function countSticky(bag: number[]): number {
  return bag.filter((orb) => orb === ORB_IDS.StickyBomb).length;
}

function countPulledBombs(game: OfflineGame): number {
  let count = 0;
  for (let i = 0; i < game.bag.length; i += 1) {
    if (game.discards[i] && orbFromId(game.bag[i] ?? 0).isBomb()) {
      count += 1;
    }
  }
  return count;
}

function applyLevelCurse(game: OfflineGame) {
  switch (game.level) {
    case 4:
      addOrbToBag(game, ORB_IDS.Bomb2);
      break;
    case 6:
      addOrbToBag(game, ORB_IDS.StickyBomb);
      break;
    case 7:
      addOrbToBag(game, ORB_IDS.Bomb2);
      break;
    default:
      break;
  }
}

function addOrbToBag(game: OfflineGame, orbId: number) {
  if (game.bag.length >= MAX_CAPACITY) {
    throw new Error("Game: bag full");
  }
  game.bag.push(orbId);
  game.discards.push(false);
}

function hasCurse(curses: number, curseBit: number): boolean {
  return ((curses >> curseBit) & 1) === 1;
}

function assertNotOver(game: OfflineGame) {
  if (game.over) {
    throw new Error("Game: is over");
  }
}

function assertNotInShop(game: OfflineGame) {
  if (game.shop) {
    throw new Error("Game: in shop");
  }
}

function assertInShop(game: OfflineGame) {
  if (!game.shop) {
    throw new Error("Game: not in shop");
  }
}

function assertCompleted(game: OfflineGame) {
  if (game.points < game.milestone) {
    throw new Error("Game: stage is not completed");
  }
}

function assertNotCompleted(game: OfflineGame) {
  if (game.points >= game.milestone) {
    throw new Error("Game: stage is completed");
  }
}
