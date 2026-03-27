import type { STEP_CONFIGS, TutorialStep } from "./steps";

export interface TutorialState {
  completed: boolean;
  active: boolean;
  step: TutorialStep;
  pullIndex: number;
  rewardModeShown: boolean;
}

export interface TutorialContextValue {
  state: TutorialState;
  shouldShowOverlay: boolean;
  currentConfig: (typeof STEP_CONFIGS)[TutorialStep];
  startTutorial: () => void;
  advance: () => void;
  setStep: (step: TutorialStep) => void;
  onPullAnimationComplete: () => void;
  onPullInitiated: () => void;
  getForcedOrbId: () => number | undefined;
  completeTutorial: () => void;
  markRewardModeShown: () => void;
  isBagStep: boolean;
  onBagOpened: () => void;
  onBagClosed: () => void;
  onOrbBought: () => void;
  onShopExited: () => void;
  onGameEnd: (won: boolean) => void;
  onShopEntered: () => void;
  isPullBlocked: boolean;
}
