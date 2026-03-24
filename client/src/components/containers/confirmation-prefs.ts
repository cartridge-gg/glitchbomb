const CASHOUT_DISMISSED_KEY = "glitchbomb:cashout-confirm-dismissed";
const SHOP_EXIT_DISMISSED_KEY = "glitchbomb:shop-exit-confirm-dismissed";

export function isCashoutConfirmDismissed(): boolean {
  try {
    return localStorage.getItem(CASHOUT_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

export function setCashoutConfirmDismissed(): void {
  try {
    localStorage.setItem(CASHOUT_DISMISSED_KEY, "true");
  } catch {
    // ignore
  }
}

export function isShopExitConfirmDismissed(): boolean {
  try {
    return localStorage.getItem(SHOP_EXIT_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

export function setShopExitConfirmDismissed(): void {
  try {
    localStorage.setItem(SHOP_EXIT_DISMISSED_KEY, "true");
  } catch {
    // ignore
  }
}
