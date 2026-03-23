const REWARD_OVERLAY_DISMISSED_KEY = "glitchbomb:reward-overlay-dismissed";

export function isRewardOverlayDismissed(): boolean {
  try {
    return localStorage.getItem(REWARD_OVERLAY_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

export function setRewardOverlayDismissed(): void {
  try {
    localStorage.setItem(REWARD_OVERLAY_DISMISSED_KEY, "true");
  } catch {
    // ignore
  }
}
