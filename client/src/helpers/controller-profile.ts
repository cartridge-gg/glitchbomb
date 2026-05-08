import type ControllerConnector from "@cartridge/connector/controller";

type Controller = ControllerConnector["controller"];
type ControllerWithSettings = Controller & {
  openSettings?: () => void;
};

function currentSearch() {
  return typeof window === "undefined" ? "" : window.location.search;
}

export function isMobileMode(search = currentSearch()) {
  return new URLSearchParams(search).has("mobile");
}

export function openControllerProfile(
  controller?: Controller,
  search?: string,
) {
  if (!controller) return;

  if (isMobileMode(search)) {
    (controller as ControllerWithSettings).openSettings?.();
    return;
  }

  controller.openProfile("inventory");
}
