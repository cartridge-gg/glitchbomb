import { type ReactNode, useCallback, useMemo, useState } from "react";
import {
  AFTER_PULL_STEPS,
  PULL_TO_EXPLAIN,
  SCRIPTED_PULL_FOR_STEP,
  STEP_CONFIGS,
  TutorialStep,
  WAIT_PULL_STEPS,
} from "./steps";
import { TutorialContext } from "./tutorial-context";
import type { TutorialState } from "./types";

const TUTORIAL_STORAGE_KEY = "glitchbomb-tutorial";

function loadTutorialState(): TutorialState {
  try {
    const raw = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        completed: parsed.completed ?? false,
        active: false,
        step: TutorialStep.HOME_WELCOME,
        pullIndex: 0,
        rewardModeShown: parsed.rewardModeShown ?? false,
      };
    }
  } catch {
    // ignore
  }
  return {
    completed: false,
    active: false,
    step: TutorialStep.HOME_WELCOME,
    pullIndex: 0,
    rewardModeShown: false,
  };
}

function saveTutorialState(state: TutorialState) {
  try {
    localStorage.setItem(
      TUTORIAL_STORAGE_KEY,
      JSON.stringify({
        completed: state.completed,
        rewardModeShown: state.rewardModeShown,
      }),
    );
  } catch {
    // ignore
  }
}

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TutorialState>(loadTutorialState);

  const updateState = useCallback(
    (updater: (prev: TutorialState) => TutorialState) => {
      setState((prev) => {
        const next = updater(prev);
        saveTutorialState(next);
        return next;
      });
    },
    [],
  );

  const startTutorial = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      active: true,
      step: TutorialStep.GAME_INTRO,
      pullIndex: 0,
    }));
  }, [updateState]);

  const advance = useCallback(() => {
    updateState((prev) => {
      // HOME_WELCOME: advance is a no-op (handled by clicking practice button)
      if (prev.step === TutorialStep.HOME_WELCOME) return prev;

      // HOME_REWARD: completing this marks tutorial as done
      if (prev.step === TutorialStep.HOME_REWARD) {
        return {
          ...prev,
          step: TutorialStep.COMPLETE,
          active: false,
          completed: true,
        };
      }

      // GAME_OVER steps: advance to HOME_REWARD
      if (
        prev.step === TutorialStep.GAME_OVER_LOSE ||
        prev.step === TutorialStep.GAME_OVER_WIN
      ) {
        return { ...prev, step: TutorialStep.HOME_REWARD };
      }

      if (!prev.active && prev.step !== TutorialStep.HOME_WELCOME) return prev;
      const nextStep = prev.step + 1;
      if (nextStep >= TutorialStep.COMPLETE) {
        return {
          ...prev,
          step: TutorialStep.COMPLETE,
          active: false,
          completed: true,
        };
      }
      return { ...prev, step: nextStep as TutorialStep };
    });
  }, [updateState]);

  const setStep = useCallback(
    (step: TutorialStep) => {
      updateState((prev) => {
        if (step === TutorialStep.COMPLETE) {
          return { ...prev, step, active: false, completed: true };
        }
        return { ...prev, step };
      });
    },
    [updateState],
  );

  const onPullAnimationComplete = useCallback(() => {
    setState((prev) => {
      if (!prev.active) return prev;
      // If we're on an "after pull" step, advance to explanation
      if (AFTER_PULL_STEPS.has(prev.step)) {
        const explainStep = PULL_TO_EXPLAIN[prev.step];
        if (explainStep !== undefined) {
          return { ...prev, step: explainStep };
        }
      }
      return prev;
    });
  }, []);

  const onPullInitiated = useCallback(() => {
    setState((prev) => {
      if (!prev.active) return prev;
      const newPullIndex = prev.pullIndex + 1;

      // If on PULL_PROMPT, advance to AFTER_PULL_1
      if (prev.step === TutorialStep.PULL_PROMPT) {
        return {
          ...prev,
          pullIndex: newPullIndex,
          step: TutorialStep.AFTER_PULL_1,
        };
      }

      // If on a WAIT_PULL step, advance to the corresponding AFTER_PULL
      if (WAIT_PULL_STEPS.has(prev.step)) {
        return {
          ...prev,
          pullIndex: newPullIndex,
          step: (prev.step + 1) as TutorialStep,
        };
      }

      return { ...prev, pullIndex: newPullIndex };
    });
  }, []);

  const getForcedOrbId = useCallback((): number | undefined => {
    if (!state.active) return undefined;
    return SCRIPTED_PULL_FOR_STEP[state.step];
  }, [state.active, state.step]);

  const completeTutorial = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      completed: true,
      active: false,
      step: TutorialStep.COMPLETE,
    }));
  }, [updateState]);

  const markRewardModeShown = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      rewardModeShown: true,
    }));
  }, [updateState]);

  const onBagOpened = useCallback(() => {
    setState((prev) => {
      if (!prev.active) return prev;
      if (prev.step === TutorialStep.BAG_EXPLAIN) {
        return { ...prev, step: TutorialStep.BAG_VIEW_EXPLAIN };
      }
      return prev;
    });
  }, []);

  const onBagClosed = useCallback(() => {
    setState((prev) => {
      if (!prev.active) return prev;
      if (prev.step === TutorialStep.BAG_VIEW_EXPLAIN) {
        return { ...prev, step: TutorialStep.WAIT_PULL_6 };
      }
      return prev;
    });
  }, []);

  const onOrbBought = useCallback(() => {
    setState((prev) => {
      if (!prev.active) return prev;
      if (
        prev.step === TutorialStep.WAIT_BUY ||
        prev.step === TutorialStep.SHOP_EXPLAIN
      ) {
        return { ...prev, step: TutorialStep.PRICE_EXPLAIN };
      }
      return prev;
    });
  }, []);

  const onShopExited = useCallback(() => {
    setState((prev) => {
      if (!prev.active) return prev;
      if (
        prev.step >= TutorialStep.SHOP_EXPLAIN &&
        prev.step <= TutorialStep.WAIT_SHOP_EXIT
      ) {
        return { ...prev, step: TutorialStep.LEVELS_EXPLAIN };
      }
      return prev;
    });
  }, []);

  const onShopEntered = useCallback(() => {
    setState((prev) => {
      if (!prev.active) return prev;
      if (prev.step === TutorialStep.ENTER_SHOP_EXPLAIN) {
        return { ...prev, step: TutorialStep.SHOP_EXPLAIN };
      }
      return prev;
    });
  }, []);

  const onGameEnd = useCallback(
    (won: boolean) => {
      updateState((prev) => {
        if (!prev.active) return prev;
        return {
          ...prev,
          step: won ? TutorialStep.GAME_OVER_WIN : TutorialStep.GAME_OVER_LOSE,
        };
      });
    },
    [updateState],
  );

  const currentConfig = STEP_CONFIGS[state.step];
  // Show overlay for active tutorial steps, plus the welcome screen (shown before "active")
  const shouldShowOverlay =
    currentConfig.hasOverlay &&
    (state.active ||
      (!state.completed && state.step === TutorialStep.HOME_WELCOME));

  const isBagStep =
    state.active &&
    (state.step === TutorialStep.BAG_EXPLAIN ||
      state.step === TutorialStep.BAG_VIEW_EXPLAIN);

  const isPullBlocked =
    state.active &&
    currentConfig.hasOverlay &&
    state.step !== TutorialStep.PULL_PROMPT;

  const value = useMemo<TutorialContextValue>(
    () => ({
      state,
      shouldShowOverlay,
      currentConfig,
      startTutorial,
      advance,
      setStep,
      onPullAnimationComplete,
      onPullInitiated,
      getForcedOrbId,
      completeTutorial,
      markRewardModeShown,
      isBagStep,
      onBagOpened,
      onBagClosed,
      onOrbBought,
      onShopExited,
      onGameEnd,
      onShopEntered,
      isPullBlocked,
    }),
    [
      state,
      shouldShowOverlay,
      currentConfig,
      startTutorial,
      advance,
      setStep,
      onPullAnimationComplete,
      onPullInitiated,
      getForcedOrbId,
      completeTutorial,
      markRewardModeShown,
      isBagStep,
      onBagOpened,
      onBagClosed,
      onOrbBought,
      onShopExited,
      onGameEnd,
      onShopEntered,
      isPullBlocked,
    ],
  );

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}
