export type RouteId = "overview" | "configure" | "automation" | "onboarding";

export type FeedbackTone = "info" | "success" | "warning" | "error";

export interface ShortcutStatus {
  toggleModeRegistered: boolean;
  toggleVisibilityRegistered: boolean;
}

export interface OverlayState {
  running: boolean;
  visible: boolean;
  clickThrough: boolean;
  editMode: boolean;
  alwaysOnTop: boolean;
  opacity: number;
  transparentBackground: boolean;
  sanitizedOrigin: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  savedUrlConfigured: boolean;
  savedUrlSanitized: string | null;
  savedX: number;
  savedY: number;
  savedWidth: number;
  savedHeight: number;
  autoOpenWithObs: boolean;
  restoreLastPosition: boolean;
  launchOnWindowsStartup: boolean;
  startPinned: boolean;
  onboardingCompleted: boolean;
  obsDetected: boolean;
  obsMonitoringActive: boolean;
  shortcuts: ShortcutStatus;
}

export interface AutomationSettingsInput {
  autoOpenWithObs: boolean;
  restoreLastPosition: boolean;
  launchOnWindowsStartup: boolean;
  startPinned: boolean;
}

export interface HeroStatusCopy {
  eyebrow: string;
  title: string;
  detail: string;
  isLive: boolean;
}
