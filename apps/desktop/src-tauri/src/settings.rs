use crate::state::{
    DEFAULT_HEIGHT, DEFAULT_OPACITY, DEFAULT_WIDTH, DEFAULT_X, DEFAULT_Y, MAX_HEIGHT, MAX_OPACITY,
    MAX_POS, MAX_WIDTH, MIN_HEIGHT, MIN_OPACITY, MIN_POS, MIN_WIDTH,
};
use crate::url_policy::validate_overlay_url;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase", default)]
pub struct PersistedSettings {
    pub saved_url: Option<String>,
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub always_on_top: bool,
    pub opacity: u8,
    pub transparent_background: bool,
    pub click_through: bool,
    pub auto_open_with_obs: bool,
    pub restore_last_position: bool,
    pub launch_on_windows_startup: bool,
    pub start_pinned: bool,
    pub onboarding_completed: bool,
}

impl Default for PersistedSettings {
    fn default() -> Self {
        Self {
            saved_url: None,
            x: DEFAULT_X,
            y: DEFAULT_Y,
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            always_on_top: true,
            opacity: DEFAULT_OPACITY,
            transparent_background: true,
            click_through: true,
            auto_open_with_obs: false,
            restore_last_position: true,
            launch_on_windows_startup: false,
            start_pinned: true,
            onboarding_completed: false,
        }
    }
}

pub fn sanitize_loaded_settings(mut settings: PersistedSettings) -> PersistedSettings {
    settings.x = settings.x.clamp(MIN_POS, MAX_POS);
    settings.y = settings.y.clamp(MIN_POS, MAX_POS);
    settings.width = settings.width.clamp(MIN_WIDTH, MAX_WIDTH);
    settings.height = settings.height.clamp(MIN_HEIGHT, MAX_HEIGHT);
    settings.opacity = settings.opacity.clamp(MIN_OPACITY, MAX_OPACITY);

    settings.saved_url = settings
        .saved_url
        .as_deref()
        .and_then(|raw| validate_overlay_url(raw).ok())
        .map(|validated| validated.url.to_string());

    settings
}

pub fn settings_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Não foi possível localizar o diretório de configuração: {e}"))?;
    Ok(dir.join("settings.json"))
}

pub fn load_settings_from_path(path: &Path) -> PersistedSettings {
    let Ok(raw) = fs::read_to_string(path) else {
        return PersistedSettings::default();
    };

    let Ok(parsed) = serde_json::from_str::<PersistedSettings>(&raw) else {
        return PersistedSettings::default();
    };

    sanitize_loaded_settings(parsed)
}

pub fn save_settings_to_path(path: &Path, settings: &PersistedSettings) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Não foi possível criar diretório de configuração: {e}"))?;
    }

    let sanitized = sanitize_loaded_settings(settings.clone());
    let payload = serde_json::to_string_pretty(&sanitized)
        .map_err(|e| format!("Falha ao serializar preferências locais: {e}"))?;

    let tmp_path = path.with_extension("json.tmp");
    fs::write(&tmp_path, payload)
        .map_err(|e| format!("Falha ao gravar arquivo temporário de preferências: {e}"))?;

    fs::rename(&tmp_path, path)
        .map_err(|e| format!("Falha ao salvar preferências locais: {e}"))?;

    Ok(())
}

pub fn load_settings(app: &AppHandle) -> PersistedSettings {
    match settings_file_path(app) {
        Ok(path) => load_settings_from_path(&path),
        Err(_) => PersistedSettings::default(),
    }
}

pub fn save_settings(app: &AppHandle, settings: &PersistedSettings) -> Result<(), String> {
    let path = settings_file_path(app)?;
    save_settings_to_path(&path, settings)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn unique_test_dir(label: &str) -> PathBuf {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos();
        std::env::temp_dir().join(format!("toranja-overlay-{label}-{nanos}"))
    }

    #[test]
    fn roundtrip_save_and_load_preserves_valid_settings() {
        let dir = unique_test_dir("roundtrip");
        let path = dir.join("settings.json");

        let input = PersistedSettings {
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
            click_through: false,
            auto_open_with_obs: true,
            restore_last_position: true,
            launch_on_windows_startup: true,
            start_pinned: false,
            onboarding_completed: true,
        };

        save_settings_to_path(&path, &input).expect("should write settings cleanly");
        let loaded = load_settings_from_path(&path);
        assert_eq!(loaded, input);

        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn load_discards_tampered_url_and_clamps_bounds() {
        let dir = unique_test_dir("tampered");
        fs::create_dir_all(&dir).unwrap();
        let path = dir.join("settings.json");

        fs::write(
            &path,
            r#"{
                "savedUrl": "http://evil.example.com/dock.html",
                "x": -99999,
                "y": 99999,
                "width": 10,
                "height": 99999,
                "opacity": 5,
                "onboardingCompleted": true
            }"#,
        )
        .unwrap();

        let loaded = load_settings_from_path(&path);
        assert_eq!(loaded.saved_url, None);
        assert_eq!(loaded.x, MIN_POS);
        assert_eq!(loaded.y, MAX_POS);
        assert_eq!(loaded.width, MIN_WIDTH);
        assert_eq!(loaded.height, MAX_HEIGHT);
        assert_eq!(loaded.opacity, MIN_OPACITY);
        assert!(loaded.transparent_background);
        assert!(loaded.onboarding_completed);

        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn load_falls_back_to_default_on_missing_or_corrupt_json() {
        let dir = unique_test_dir("corrupt");
        fs::create_dir_all(&dir).unwrap();
        let missing_path = dir.join("missing.json");
        assert_eq!(load_settings_from_path(&missing_path), PersistedSettings::default());

        let corrupt_path = dir.join("corrupt.json");
        fs::write(&corrupt_path, "{ not valid json").unwrap();
        assert_eq!(load_settings_from_path(&corrupt_path), PersistedSettings::default());

        let _ = fs::remove_dir_all(&dir);
    }
}
