import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notificationDeeplink as notificationDeeplinkFromPayload } from "./notification-deeplinks";

export function NotificationEvents() {
  const navigate = useNavigate();
  const handleNotificationClick = useCallback(
    (detail: unknown) => {
      const path = notificationDeeplinkFromPayload(
        detail,
        globalThis.location?.origin,
      );

      if (!path) return;

      navigate(path);
    },
    [navigate],
  );

  useEffect(() => {
    const onNotificationClick = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      handleNotificationClick(detail);
    };

    window.addEventListener("push-notification-click", onNotificationClick);

    return () => {
      window.removeEventListener(
        "push-notification-click",
        onNotificationClick,
      );
    };
  }, [handleNotificationClick]);

  return null;
}
