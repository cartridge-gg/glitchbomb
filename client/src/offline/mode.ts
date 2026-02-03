export const OFFLINE_MODE_ENV =
  import.meta.env.VITE_OFFLINE_MODE === "true";

export function isOfflineMode(): boolean {
  if (OFFLINE_MODE_ENV) return true;
  if (typeof window === "undefined") return false;
  const path = window.location.pathname || "";
  if (!path.startsWith("/games") && !path.startsWith("/play")) {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get("offline") === "1" || params.get("offline") === "true") {
    return true;
  }
  try {
    return window.localStorage.getItem("gb_offline_mode") === "1";
  } catch {
    return false;
  }
}
