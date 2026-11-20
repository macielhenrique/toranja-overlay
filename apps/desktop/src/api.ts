import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { AutomationSettingsInput, OverlayState } from "./types";

export async function getOverlayState(): Promise<OverlayState> {
  return invoke<OverlayState>("get_overlay_state");
}

export async function getSavedUrl(): Promise<string | null> {
  return invoke<string | null>("get_saved_url");
}

export async function validateOverlayUrl(url: string): Promise<string> {
  return invoke<string>("validate_overlay_url", { url });
}

export async function saveOverlayUrl(url: string): Promise<OverlayState> {
  return invoke<OverlayState>("save_overlay_url", { url });
}

export async function startOverlay(params: {
  url?: string | null;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}): Promise<OverlayState> {
  return invoke<OverlayState>("start_overlay", {
    url: params.url ?? null,
    x: params.x ?? null,
    y: params.y ?? null,
    width: params.width ?? null,
    height: params.height ?? null,
  });
}

export async function stopOverlay(): Promise<OverlayState> {
  return invoke<OverlayState>("stop_overlay");
}

export async function setOverlayClickThrough(
  enabled: boolean
): Promise<OverlayState> {
  return invoke<OverlayState>("set_overlay_click_through", { enabled });
}

export async function setOverlayEditMode(
  editMode: boolean
): Promise<OverlayState> {
  return invoke<OverlayState>("set_overlay_edit_mode", { editMode });
}

export async function setOverlayAlwaysOnTop(
  enabled: boolean
): Promise<OverlayState> {
  return invoke<OverlayState>("set_overlay_always_on_top", { enabled });
}

export async function setOverlayOpacity(
  opacity: number,
  persist = true
): Promise<OverlayState> {
  return invoke<OverlayState>("set_overlay_opacity", { opacity, persist });
}

export async function setOverlayTransparentBackground(
  enabled: boolean
): Promise<OverlayState> {
  return invoke<OverlayState>("set_overlay_transparent_background", { enabled });
}

export async function setOverlayVisibility(
  visible: boolean
): Promise<OverlayState> {
  return invoke<OverlayState>("set_overlay_visibility", { visible });
}

export async function saveOverlayPosition(bounds: {
  x: number;
  y: number;
  width: number;
  height: number;
}): Promise<OverlayState> {
  return invoke<OverlayState>("save_overlay_position", bounds);
}

export async function resetOverlayPosition(): Promise<OverlayState> {
  return invoke<OverlayState>("reset_overlay_position");
}

export async function updateAutomationSettings(
  input: AutomationSettingsInput
): Promise<OverlayState> {
  return invoke<OverlayState>("update_automation_settings", {
    autoOpenWithObs: input.autoOpenWithObs,
    restoreLastPosition: input.restoreLastPosition,
    launchOnWindowsStartup: input.launchOnWindowsStartup,
    startPinned: input.startPinned,
  });
}

export async function recoverOverlay(): Promise<OverlayState> {
  return invoke<OverlayState>("recover_overlay");
}

export async function openSocialStreamSite(): Promise<void> {
  return invoke<void>("open_social_stream_site");
}

export async function listenOverlayState(
  handler: (state: OverlayState) => void
): Promise<UnlistenFn> {
  return listen<OverlayState>("overlay-state-changed", (event) => {
    handler(event.payload);
  });
}
