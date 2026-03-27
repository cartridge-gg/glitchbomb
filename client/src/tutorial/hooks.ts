import { useContext } from "react";
import { TutorialContext } from "./tutorial-context";
import type { TutorialContextValue } from "./types";

export function useTutorial(): TutorialContextValue {
  const ctx = useContext(TutorialContext);
  if (!ctx) {
    throw new Error("useTutorial must be used within TutorialProvider");
  }
  return ctx;
}

export function useTutorialOptional(): TutorialContextValue | null {
  return useContext(TutorialContext);
}
