export type NativeNotificationPayload = {
  deeplink?: unknown;
  deepLink?: unknown;
  url?: unknown;
  kind?: unknown;
};

const notificationPayload = (payload: unknown): NativeNotificationPayload => {
  if (!payload || typeof payload !== "object") return {};
  return payload as NativeNotificationPayload;
};

export const notificationKind = (payload: unknown): string | undefined => {
  const { kind } = notificationPayload(payload);
  return typeof kind === "string" && kind.trim() ? kind.trim() : undefined;
};

export const notificationDeeplinkToPath = (
  deeplink: unknown,
  origin?: string,
): string | undefined => {
  if (typeof deeplink !== "string") return undefined;

  const rawDeeplink = deeplink.trim();
  if (!rawDeeplink) return undefined;

  if (rawDeeplink.startsWith("/")) {
    if (rawDeeplink.startsWith("//")) return undefined;
    return rawDeeplink;
  }

  if (!origin) return undefined;

  try {
    const url = new URL(rawDeeplink, origin);

    if (url.protocol === "glitchbomb:" || url.protocol === "glitch-bomb:") {
      const hostPath = url.host ? `/${url.host}` : "";
      return `${hostPath}${url.pathname}${url.search}${url.hash}`;
    }

    if (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.origin === origin
    ) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return undefined;
  }

  return undefined;
};

export const notificationDeeplink = (
  payload: unknown,
  origin?: string,
): string | undefined => {
  const { deeplink, deepLink, url } = notificationPayload(payload);
  return notificationDeeplinkToPath(deeplink ?? deepLink ?? url, origin);
};
