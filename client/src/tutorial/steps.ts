import { ORB_IDS } from "@/offline/orbs";

export enum TutorialStep {
  // Home page
  HOME_WELCOME = 0,

  // Game intro
  GAME_INTRO = 1,
  PULL_PROMPT = 2,

  // Pull 1: Point5
  AFTER_PULL_1 = 3,
  POINT_EXPLAIN = 4,

  // Pull 2: Bomb1
  WAIT_PULL_2 = 5,
  AFTER_PULL_2 = 6,
  BOMB_EXPLAIN = 7,

  // Pull 3: Multiplier100
  WAIT_PULL_3 = 8,
  AFTER_PULL_3 = 9,
  MULT_EXPLAIN = 10,

  // Pull 4: Bomb3
  WAIT_PULL_4 = 11,
  AFTER_PULL_4 = 12,
  TRIPLE_BOMB_EXPLAIN = 13,

  // Cash out / risk explanation
  CASHOUT_EXPLAIN = 14,
  RISK_EXPLAIN = 15,

  // Pull 5: Health1
  WAIT_PULL_5 = 16,
  AFTER_PULL_5 = 17,
  BAG_EXPLAIN = 18,
  BAG_VIEW_EXPLAIN = 19,

  // Pull 6: Point5 → milestone
  WAIT_PULL_6 = 20,
  AFTER_PULL_6 = 21,

  // Milestone
  LEVEL_COMPLETE = 22,
  CONTINUE_EXPLAIN = 23,
  ENTER_SHOP_EXPLAIN = 24,

  // Shop
  SHOP_EXPLAIN = 25,
  WAIT_BUY = 26,
  PRICE_EXPLAIN = 27,
  WAIT_SHOP_EXIT = 28,
  LEVELS_EXPLAIN = 29,

  // Free play until game ends
  FREE_PLAY = 30,

  // Game end
  GAME_OVER_LOSE = 31,
  GAME_OVER_WIN = 32,

  // Back on home
  HOME_REWARD = 33,
  REWARD_MODE_EXPLAIN = 34,

  // Done
  COMPLETE = 35,
}

/** Scripted orb IDs for tutorial pulls 1-6 */
export const TUTORIAL_PULL_SEQUENCE = [
  ORB_IDS.Point5, // Pull 1
  ORB_IDS.Bomb1, // Pull 2
  ORB_IDS.Multiplier100, // Pull 3
  ORB_IDS.Bomb3, // Pull 4
  ORB_IDS.Health1, // Pull 5
  ORB_IDS.Point5, // Pull 6
];

export interface TutorialStepConfig {
  title?: string;
  message?: string;
  /** data-tutorial-id of element to spotlight */
  target?: string;
  /** Position of tooltip relative to target */
  position?: "top" | "bottom" | "left" | "right";
  /** Shape of the spotlight cutout (default: "rect") */
  spotlightShape?: "rect" | "circle";
  /** If true, show the overlay message */
  hasOverlay: boolean;
  /** Page this step belongs to */
  page: "home" | "game";
}

export const STEP_CONFIGS: Record<TutorialStep, TutorialStepConfig> = {
  [TutorialStep.HOME_WELCOME]: {
    title: "Welcome to Glitch Bomb!",
    message: "Since you're new, let's Practice.\nPractice for free anytime!",
    target: "practice-button",
    position: "top",
    hasOverlay: true,
    page: "home",
  },
  [TutorialStep.GAME_INTRO]: {
    title: "You've discovered a Glitch.",
    message:
      "Incredible rewards await, but they're not without Risk.\nPull too many Glitch Bombs, and you Glitch Out.\nCash Out while you still have Health to Win!",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.PULL_PROMPT]: {
    title: "Tap here to pull an Orb.",
    target: "puller",
    position: "bottom",
    spotlightShape: "circle",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.AFTER_PULL_1]: {
    hasOverlay: false,
    page: "game",
  },
  [TutorialStep.POINT_EXPLAIN]: {
    message: "Green Orbs give you Points. Get enough Points to beat the Level!",
    target: "goal-bar",
    position: "bottom",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.WAIT_PULL_2]: {
    hasOverlay: false,
    page: "game",
  },
  [TutorialStep.AFTER_PULL_2]: {
    hasOverlay: false,
    page: "game",
  },
  [TutorialStep.BOMB_EXPLAIN]: {
    message: "Bombs reduce your Health. If you have 0 Health, you lose.",
    target: "health-bar",
    position: "bottom",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.WAIT_PULL_3]: {
    hasOverlay: false,
    page: "game",
  },
  [TutorialStep.AFTER_PULL_3]: {
    hasOverlay: false,
    page: "game",
  },
  [TutorialStep.MULT_EXPLAIN]: {
    message: "Multipliers increase your future Points Orbs pulled.",
    target: "multiplier",
    position: "bottom",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.WAIT_PULL_4]: {
    hasOverlay: false,
    page: "game",
  },
  [TutorialStep.AFTER_PULL_4]: {
    hasOverlay: false,
    page: "game",
  },
  [TutorialStep.TRIPLE_BOMB_EXPLAIN]: {
    message:
      "Oh no! You pulled a Triple Bomb and lost 3 Health!\nIf you lose 1 more Health you're dead.",
    target: "bomb-tracker",
    position: "top",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.CASHOUT_EXPLAIN]: {
    message:
      "If you think you're about to lose, Cash Out to secure your winnings. This ends your game and converts any Points you had into Moon Rocks. You win!",
    target: "cash-out-button",
    position: "top",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.RISK_EXPLAIN]: {
    title: "Should you Risk it?",
    message:
      "You're only risking 5 Points right now, might as well pull again.",
    target: "points-display",
    position: "bottom",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.WAIT_PULL_5]: {
    hasOverlay: false,
    page: "game",
  },
  [TutorialStep.AFTER_PULL_5]: {
    hasOverlay: false,
    page: "game",
  },
  [TutorialStep.BAG_EXPLAIN]: {
    message:
      "You can see what Orbs are left in your bag by tapping here. May the odds be ever in your favor.",
    target: "bag-button",
    position: "top",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.BAG_VIEW_EXPLAIN]: {
    message: "Tap on an Orb to see what it does.",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.WAIT_PULL_6]: {
    hasOverlay: false,
    page: "game",
  },
  [TutorialStep.AFTER_PULL_6]: {
    hasOverlay: false,
    page: "game",
  },
  [TutorialStep.LEVEL_COMPLETE]: {
    title: "Level 1 Complete",
    message: "Congrats! You needed 12 Points to beat Level 1. You scored 15!",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.CONTINUE_EXPLAIN]: {
    title: "Cash Out or Continue?",
    message:
      "You can Cash Out here, or you can Continue into harder, more lucrative Levels.\nLet's Continue for now.",
    target: "continue-button",
    position: "bottom",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.ENTER_SHOP_EXPLAIN]: {
    message:
      "When you Continue, pay a small Moon Rock ante, and convert all your Points into Bits.",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.SHOP_EXPLAIN]: {
    title: "Make your own Luck!",
    message:
      "After each Level, you can spend Bits in the Shop to add more Orbs to your bag.\nUnspent Bits are retained for future Shops.",
    target: "chips-display",
    position: "bottom",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.WAIT_BUY]: {
    hasOverlay: false,
    page: "game",
  },
  [TutorialStep.PRICE_EXPLAIN]: {
    message: "Every time you buy an Orb, that Orb increases in price.",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.WAIT_SHOP_EXIT]: {
    hasOverlay: false,
    page: "game",
  },
  [TutorialStep.LEVELS_EXPLAIN]: {
    message:
      "There's 7 Levels to complete.\nMost bags won't make it to Level 7.\nCash Out when you're in danger.\nCash Out, and you WIN!",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.FREE_PLAY]: {
    hasOverlay: false,
    page: "game",
  },
  [TutorialStep.GAME_OVER_LOSE]: {
    title: "You Glitched Out!",
    message:
      "Too bad! You lost all your Points, but you earned some Moon Rocks anyway.\nIf you play in Reward Mode, your Moon Rocks are converted into Glitch Tokens at the end of the game. You can exchange Glitch Tokens for dollars at any time!",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.GAME_OVER_WIN]: {
    title: "You Win!",
    message:
      "Great choice! You converted all your Points to Moon Rocks.\nIf you play in Reward Mode, your Moon Rocks are converted into Glitch Tokens at the end of the game. You can exchange Glitch Tokens for dollars at any time!",
    hasOverlay: true,
    page: "game",
  },
  [TutorialStep.HOME_REWARD]: {
    title: "Reward Mode",
    message: "If you want to win rewards, you'll have to risk something first.",
    target: "reward-mode",
    position: "top",
    hasOverlay: true,
    page: "home",
  },
  [TutorialStep.REWARD_MODE_EXPLAIN]: {
    title: "More Risk, More Rewards",
    message:
      "Multiply your potential rewards by upping the ante.\nYour best return ratio exists at the highest risk.\nThe gameplay is always exactly the same.",
    target: "risk-plus-button",
    position: "top",
    hasOverlay: true,
    page: "home",
  },
  [TutorialStep.COMPLETE]: {
    hasOverlay: false,
    page: "home",
  },
};

/** Steps that wait for pull animation to finish before advancing */
export const AFTER_PULL_STEPS = new Set([
  TutorialStep.AFTER_PULL_1,
  TutorialStep.AFTER_PULL_2,
  TutorialStep.AFTER_PULL_3,
  TutorialStep.AFTER_PULL_4,
  TutorialStep.AFTER_PULL_5,
  TutorialStep.AFTER_PULL_6,
]);

/** Map from "after pull" step to the explanation that follows */
export const PULL_TO_EXPLAIN: Record<number, TutorialStep> = {
  [TutorialStep.AFTER_PULL_1]: TutorialStep.POINT_EXPLAIN,
  [TutorialStep.AFTER_PULL_2]: TutorialStep.BOMB_EXPLAIN,
  [TutorialStep.AFTER_PULL_3]: TutorialStep.MULT_EXPLAIN,
  [TutorialStep.AFTER_PULL_4]: TutorialStep.TRIPLE_BOMB_EXPLAIN,
  [TutorialStep.AFTER_PULL_5]: TutorialStep.BAG_EXPLAIN,
  [TutorialStep.AFTER_PULL_6]: TutorialStep.LEVEL_COMPLETE,
};

/** Steps that are "wait" steps (no overlay, wait for user action) */
export const WAIT_PULL_STEPS = new Set([
  TutorialStep.WAIT_PULL_2,
  TutorialStep.WAIT_PULL_3,
  TutorialStep.WAIT_PULL_4,
  TutorialStep.WAIT_PULL_5,
  TutorialStep.WAIT_PULL_6,
]);

/** Forced orb for each scripted pull step */
export const SCRIPTED_PULL_FOR_STEP: Record<number, number> = {
  [TutorialStep.PULL_PROMPT]: ORB_IDS.Point5,
  [TutorialStep.WAIT_PULL_2]: ORB_IDS.Bomb1,
  [TutorialStep.WAIT_PULL_3]: ORB_IDS.Multiplier100,
  [TutorialStep.WAIT_PULL_4]: ORB_IDS.Bomb3,
  [TutorialStep.WAIT_PULL_5]: ORB_IDS.Health1,
  [TutorialStep.WAIT_PULL_6]: ORB_IDS.Point5,
};
