use crate::settings::PersistedSettings;
use crate::url_policy::validate_overlay_url;
use serde::Serialize;
use std::sync::atomic::AtomicBool;
use std::sync::{Arc, Mutex};

pub const DEFAULT_X: i32 = 40;
pub const DEFAULT_Y: i32 = 40;
pub const DEFAULT_WIDTH: u32 = 420;
pub const DEFAULT_HEIGHT: u32 = 680;
pub const MIN_WIDTH: u32 = 180;
pub const MIN_HEIGHT: u32 = 140;
pub const MAX_WIDTH: u32 = 3840;
pub const MAX_HEIGHT: u32 = 2160;
pub const MIN_POS: i32 = -10000;
pub const MAX_POS: i32 = 10000;
pub const DEFAULT_OPACITY: u8 = 100;
pub const MIN_OPACITY: u8 = 20;
pub const MAX_OPACITY: u8 = 100;

#[derive(Debug, Clone, Default, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ShortcutStatus {
    pub toggle_mode_registered: bool,
    pub toggle_visibility_registered: bool,
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct OverlayState {
    pub running: bool,
    pub visible: bool,
    pub click_through: bool,
    pub edit_mode: bool,
    pub always_on_top: bool,
    pub opacity: u8,
    pub transparent_background: bool,
    pub sanitized_origin: Option<String>,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub saved_url_configured: bool,
    pub saved_url_sanitized: Option<String>,
    pub saved_x: i32,
    pub saved_y: i32,
    pub saved_width: u32,
    pub saved_height: u32,
    pub auto_open_with_obs: bool,
    pub restore_last_position: bool,
    pub launch_on_windows_startup: bool,
    pub start_pinned: bool,
    pub onboarding_completed: bool,
    pub obs_detected: bool,
    pub obs_monitoring_active: bool,
    pub shortcuts: ShortcutStatus,
}

impl Default for OverlayState {
    fn default() -> Self {
        Self {
            running: false,
            visible: false,
            click_through: true,
            edit_mode: false,
            always_on_top: true,
            opacity: DEFAULT_OPACITY,
            transparent_background: true,
            sanitized_origin: None,
            x: DEFAULT_X,
            y: DEFAULT_Y,
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            saved_url_configured: false,
            saved_url_sanitized: None,
            saved_x: DEFAULT_X,
            saved_y: DEFAULT_Y,
            saved_width: DEFAULT_WIDTH,
            saved_height: DEFAULT_HEIGHT,
            auto_open_with_obs: false,
            restore_last_position: true,
            launch_on_windows_startup: false,
            start_pinned: true,
            onboarding_completed: false,
            obs_detected: false,
            obs_monitoring_active: cfg!(windows),
            shortcuts: ShortcutStatus::default(),
        }
    }
}

impl OverlayState {
    pub fn from_persisted(
        settings: &PersistedSettings,
        obs_detected: bool,
        startup_enabled: bool,
    ) -> Self {
        let saved_url_sanitized = settings
            .saved_url
            .as_deref()
            .and_then(|raw| validate_overlay_url(raw).ok())
            .map(|validated| validated.sanitized_display);

        let saved_x = settings.x.clamp(MIN_POS, MAX_POS);
        let saved_y = settings.y.clamp(MIN_POS, MAX_POS);
        let saved_width = settings.width.clamp(MIN_WIDTH, MAX_WIDTH);
        let saved_height = settings.height.clamp(MIN_HEIGHT, MAX_HEIGHT);

        let (x, y, width, height) = if settings.restore_last_position {
            (saved_x, saved_y, saved_width, saved_height)
        } else {
            (DEFAULT_X, DEFAULT_Y, DEFAULT_WIDTH, DEFAULT_HEIGHT)
        };

        Self {
            running: false,
            visible: false,
            click_through: settings.click_through,
            edit_mode: false,
            always_on_top: settings.always_on_top,
            opacity: settings.opacity.clamp(MIN_OPACITY, MAX_OPACITY),
            transparent_background: settings.transparent_background,
            sanitized_origin: None,
            x,
            y,
            width,
            height,
            saved_url_configured: saved_url_sanitized.is_some(),
            saved_url_sanitized,
            saved_x,
            saved_y,
            saved_width,
            saved_height,
            auto_open_with_obs: settings.auto_open_with_obs,
            restore_last_position: settings.restore_last_position,
            launch_on_windows_startup: startup_enabled,
            start_pinned: settings.start_pinned,
            onboarding_completed: settings.onboarding_completed,
            obs_detected,
            obs_monitoring_active: cfg!(windows),
            shortcuts: ShortcutStatus::default(),
        }
    }

    pub fn to_persisted(&self, saved_url: Option<String>) -> PersistedSettings {
        PersistedSettings {
            saved_url,
            x: self.saved_x.clamp(MIN_POS, MAX_POS),
            y: self.saved_y.clamp(MIN_POS, MAX_POS),
            width: self.saved_width.clamp(MIN_WIDTH, MAX_WIDTH),
            height: self.saved_height.clamp(MIN_HEIGHT, MAX_HEIGHT),
            always_on_top: self.always_on_top,
            opacity: self.opacity.clamp(MIN_OPACITY, MAX_OPACITY),
            transparent_background: self.transparent_background,
            click_through: self.click_through,
            auto_open_with_obs: self.auto_open_with_obs,
            restore_last_position: self.restore_last_position,
            launch_on_windows_startup: self.launch_on_windows_startup,
            start_pinned: self.start_pinned,
            onboarding_completed: self.onboarding_completed,
        }
    }

    pub fn apply_bounds(&mut self, x: i32, y: i32, width: u32, height: u32) {
        self.x = x.clamp(MIN_POS, MAX_POS);
        self.y = y.clamp(MIN_POS, MAX_POS);
        self.width = width.clamp(MIN_WIDTH, MAX_WIDTH);
        self.height = height.clamp(MIN_HEIGHT, MAX_HEIGHT);
    }

    pub fn apply_saved_position(&mut self, x: i32, y: i32, width: u32, height: u32) {
        self.apply_bounds(x, y, width, height);
        self.saved_x = self.x;
        self.saved_y = self.y;
        self.saved_width = self.width;
        self.saved_height = self.height;
    }

    pub fn reset_saved_position(&mut self) {
        self.apply_saved_position(DEFAULT_X, DEFAULT_Y, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }

    pub fn set_edit_mode(&mut self, edit_mode: bool) {
        if edit_mode {
            self.edit_mode = true;
            self.click_through = false;
        } else {
            self.edit_mode = false;
            self.click_through = true;
        }
    }

    pub fn set_click_through(&mut self, enabled: bool) {
        self.click_through = enabled;
        if enabled {
            self.edit_mode = false;
        }
    }

    pub fn set_opacity(&mut self, opacity: u8) {
        self.opacity = opacity.clamp(MIN_OPACITY, MAX_OPACITY);
    }

    pub fn mark_started(&mut self, sanitized_origin: String) {
        self.running = true;
        self.visible = true;
        self.sanitized_origin = Some(sanitized_origin);
    }

    pub fn mark_stopped(&mut self) {
        self.running = false;
        self.visible = false;
        self.sanitized_origin = None;
        self.edit_mode = false;
        self.click_through = true;
    }
}

pub struct OverlayRuntime {
    pub state: Mutex<OverlayState>,
    pub saved_url: Mutex<Option<String>>,
    pub obs_auto_opened_this_session: AtomicBool,
    pub stop_obs_monitor: Arc<AtomicBool>,
}

impl Default for OverlayRuntime {
    fn default() -> Self {
        Self {
            state: Mutex::new(OverlayState::default()),
            saved_url: Mutex::new(None),
            obs_auto_opened_this_session: AtomicBool::new(false),
            stop_obs_monitor: Arc::new(AtomicBool::new(false)),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_state_is_safe_game_mode() {
        let state = OverlayState::default();
        assert!(!state.running);
        assert!(!state.visible);
        assert!(state.click_through);
        assert!(!state.edit_mode);
        assert!(state.always_on_top);
        assert_eq!(state.opacity, DEFAULT_OPACITY);
        assert!(state.transparent_background);
        assert_eq!(state.sanitized_origin, None);
        assert!(!state.saved_url_configured);
        assert_eq!(state.x, DEFAULT_X);
        assert_eq!(state.y, DEFAULT_Y);
        assert_eq!(state.width, DEFAULT_WIDTH);
        assert_eq!(state.height, DEFAULT_HEIGHT);
        assert!(state.restore_last_position);
        assert!(state.start_pinned);
        assert!(!state.auto_open_with_obs);
        assert!(!state.onboarding_completed);
    }

    #[test]
    fn toggling_edit_mode_updates_click_through() {
        let mut state = OverlayState::default();
        state.set_edit_mode(true);
        assert!(state.edit_mode);
        assert!(!state.click_through);

        state.set_edit_mode(false);
        assert!(!state.edit_mode);
        assert!(state.click_through);
    }

    #[test]
    fn enabling_click_through_exits_edit_mode_but_disabling_keeps_mode() {
        let mut state = OverlayState::default();
        state.set_edit_mode(true);
        state.set_click_through(true);
        assert!(!state.edit_mode);
        assert!(state.click_through);

        state.set_click_through(false);
        assert!(!state.edit_mode);
        assert!(!state.click_through);
    }

    #[test]
    fn bounds_clamping_supports_negative_multimonitor_coords_and_enforces_limits() {
        let mut state = OverlayState::default();
        state.apply_saved_position(-1280, -240, 50, 99999);
        assert_eq!(state.x, -1280);
        assert_eq!(state.y, -240);
        assert_eq!(state.width, MIN_WIDTH);
        assert_eq!(state.height, MAX_HEIGHT);
        assert_eq!(state.saved_x, -1280);
        assert_eq!(state.saved_width, MIN_WIDTH);

        state.reset_saved_position();
        assert_eq!(state.x, DEFAULT_X);
        assert_eq!(state.y, DEFAULT_Y);
        assert_eq!(state.width, DEFAULT_WIDTH);
        assert_eq!(state.height, DEFAULT_HEIGHT);
        assert_eq!(state.saved_x, DEFAULT_X);
        assert_eq!(state.saved_height, DEFAULT_HEIGHT);
    }

    #[test]
    fn mark_started_and_stopped_reset_lifecycle_cleanly() {
        let mut state = OverlayState::default();
        state.set_edit_mode(true);
        state.mark_started("https://socialstream.ninja/dock.html [sessão ocultada]".to_string());
        assert!(state.running);
        assert!(state.visible);
        assert!(state.sanitized_origin.is_some());

        state.mark_stopped();
        assert!(!state.running);
        assert!(!state.visible);
        assert_eq!(state.sanitized_origin, None);
        assert!(!state.edit_mode);
        assert!(state.click_through);
    }

    #[test]
    fn from_persisted_and_to_persisted_preserve_and_sanitize_state() {
        let persisted = PersistedSettings {
            saved_url: Some(
                "https://socialstream.ninja/dock.html?session=TEST_PLACEHOLDER_TOKEN".to_string(),
            ),
            x: 1020,
            y: 78,
            width: 360,
            height: 540,
            always_on_top: false,
            opacity: 65,
            transparent_background: false,
            click_through: true,
            auto_open_with_obs: true,
            restore_last_position: true,
            launch_on_windows_startup: true,
            start_pinned: false,
            onboarding_completed: true,
        };

        let mut state = OverlayState::from_persisted(&persisted, true, true);
        assert!(state.saved_url_configured);
        assert_eq!(
            state.saved_url_sanitized.as_deref(),
            Some("https://socialstream.ninja/dock.html [sessão ocultada]")
        );
        assert_eq!(state.x, 1020);
        assert_eq!(state.y, 78);
        assert_eq!(state.width, 360);
        assert_eq!(state.height, 540);
        assert!(!state.always_on_top);
        assert_eq!(state.opacity, 65);
        assert!(!state.transparent_background);
        assert!(state.auto_open_with_obs);
        assert!(!state.start_pinned);
        assert!(state.obs_detected);
        assert!(state.launch_on_windows_startup);

        let roundtrip = state.to_persisted(persisted.saved_url.clone());
        assert_eq!(roundtrip, persisted);

        state.set_opacity(5);
        assert_eq!(state.opacity, MIN_OPACITY);
        state.set_opacity(250);
        assert_eq!(state.opacity, MAX_OPACITY);
    }
}
