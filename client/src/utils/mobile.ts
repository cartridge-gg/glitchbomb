export const isMobile = new URLSearchParams(window.location.search).has(
  "mobile",
);

/**
 * Append `?mobile` (or `&mobile`) to a path when running in mobile mode.
 */
export function mobilePath(path: string): string {
  if (!isMobile) return path;
  return path + (path.includes("?") ? "&mobile" : "?mobile");
}
