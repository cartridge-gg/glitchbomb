import { isMobileMode, openControllerProfile } from "./controller-profile";

describe("controller profile helpers", () => {
  it("detects the mobile query parameter", () => {
    expect(isMobileMode("?mobile")).toBe(true);
    expect(isMobileMode("?ref=0x123&mobile")).toBe(true);
    expect(isMobileMode("?ref=0x123")).toBe(false);
  });

  it("opens settings in mobile mode", () => {
    const controller = {
      openProfile: jest.fn(),
      openSettings: jest.fn(),
    };

    openControllerProfile(controller as never, "?mobile");

    expect(controller.openSettings).toHaveBeenCalledTimes(1);
    expect(controller.openProfile).not.toHaveBeenCalled();
  });

  it("opens inventory outside mobile mode", () => {
    const controller = {
      openProfile: jest.fn(),
      openSettings: jest.fn(),
    };

    openControllerProfile(controller as never, "");

    expect(controller.openProfile).toHaveBeenCalledWith("inventory");
    expect(controller.openSettings).not.toHaveBeenCalled();
  });
});
