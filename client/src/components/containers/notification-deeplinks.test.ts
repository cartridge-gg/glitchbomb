import {
  notificationDeeplink,
  notificationDeeplinkToPath,
  notificationKind,
} from "./notification-deeplinks";

describe("notification deeplinks", () => {
  const origin = "https://glitchbomb-ten.preview.cartridge.gg";

  it("uses path deeplinks directly", () => {
    expect(notificationDeeplinkToPath("/game/0x123?turn=4", origin)).toBe(
      "/game/0x123?turn=4",
    );
  });

  it("uses same-origin web URLs as internal paths", () => {
    expect(
      notificationDeeplinkToPath(
        "https://glitchbomb-ten.preview.cartridge.gg/game/7",
        origin,
      ),
    ).toBe("/game/7");
  });

  it("converts glitchbomb app scheme URLs to internal paths", () => {
    expect(
      notificationDeeplinkToPath("glitchbomb://game/0xabc?tab=score", origin),
    ).toBe("/game/0xabc?tab=score");
    expect(notificationDeeplinkToPath("glitchbomb:///practice", origin)).toBe(
      "/practice",
    );
    expect(notificationDeeplinkToPath("glitch-bomb://tutorial", origin)).toBe(
      "/tutorial",
    );
  });

  it("rejects external URLs", () => {
    expect(
      notificationDeeplinkToPath("https://example.com/game/0x123", origin),
    ).toBeUndefined();
    expect(
      notificationDeeplinkToPath("//example.com/game/0x123", origin),
    ).toBeUndefined();
  });

  it("reads deeplink aliases and kind metadata from payloads", () => {
    expect(notificationDeeplink({ deepLink: "/game/7" }, origin)).toBe(
      "/game/7",
    );
    expect(notificationDeeplink({ url: "/practice" }, origin)).toBe(
      "/practice",
    );
    expect(notificationKind({ kind: " game-ready " })).toBe("game-ready");
  });
});
