import { describe, expect, it } from "vitest";
import {
  formatDimensions,
  formatPixels,
  getHeroStatusCopy,
  getNavItem,
  NAV_ITEMS,
  resolveInitialRoute,
} from "./navigation";
import type { OverlayState } from "./types";

function makeBaseState(overrides: Partial<OverlayState> = {}): OverlayState {
  return {
    running: false,
    visible: false,
    clickThrough: true,
    editMode: false,
    alwaysOnTop: true,
    opacity: 100,
    transparentBackground: true,
    sanitizedOrigin: null,
    x: 40,
    y: 40,
    width: 420,
    height: 680,
    savedUrlConfigured: false,
    savedUrlSanitized: null,
    savedX: 40,
    savedY: 40,
    savedWidth: 420,
    savedHeight: 680,
    autoOpenWithObs: false,
    restoreLastPosition: true,
    launchOnWindowsStartup: false,
    startPinned: true,
    onboardingCompleted: false,
    obsDetected: false,
    obsMonitoringActive: true,
    shortcuts: {
      toggleModeRegistered: true,
      toggleVisibilityRegistered: true,
    },
    ...overrides,
  };
}

describe("navigation and state helpers", () => {
  it("defines the four Figma screens in sidebar order", () => {
    expect(NAV_ITEMS.map((i) => i.id)).toEqual([
      "overview",
      "configure",
      "automation",
      "onboarding",
    ]);
    expect(getNavItem("onboarding").pageTitle).toBe("Primeira configuração");
  });

  it("resolves onboarding route only when first-time setup has not been completed", () => {
    expect(
      resolveInitialRoute({
        savedUrlConfigured: false,
        onboardingCompleted: false,
      })
    ).toBe("onboarding");

    expect(
      resolveInitialRoute({
        savedUrlConfigured: true,
        onboardingCompleted: false,
      })
    ).toBe("overview");

    expect(
      resolveInitialRoute({
        savedUrlConfigured: false,
        onboardingCompleted: true,
      })
    ).toBe("overview");
  });

  it("formats pixel values and dimensions using pt-BR conventions", () => {
    expect(formatPixels(1020)).toBe("1.020 px");
    expect(formatPixels(78)).toBe("78 px");
    expect(formatDimensions(360, 540)).toBe("360 × 540");
  });

  it("computes hero status copy across disconnected, pinned, edit, and hidden states", () => {
    const unconfigured = getHeroStatusCopy(makeBaseState());
    expect(unconfigured.eyebrow).toBe("OVERLAY DESCONECTADO");
    expect(unconfigured.title).toBe("Configure seu link");
    expect(unconfigured.isLive).toBe(false);

    const ready = getHeroStatusCopy(makeBaseState({ savedUrlConfigured: true }));
    expect(ready.title).toBe("Pronto para iniciar");

    const pinned = getHeroStatusCopy(
      makeBaseState({ running: true, visible: true, clickThrough: true })
    );
    expect(pinned.eyebrow).toBe("OVERLAY EM EXECUÇÃO");
    expect(pinned.title).toBe("Janela fixa");
    expect(pinned.detail).toBe("Cliques passam para o jogo");
    expect(pinned.isLive).toBe(true);

    const editMode = getHeroStatusCopy(
      makeBaseState({
        running: true,
        visible: true,
        editMode: true,
        clickThrough: false,
      })
    );
    expect(editMode.title).toBe("Modo edição");

    const hidden = getHeroStatusCopy(
      makeBaseState({ running: true, visible: false })
    );
    expect(hidden.eyebrow).toBe("OVERLAY OCULTO");
    expect(hidden.isLive).toBe(false);
  });
});
