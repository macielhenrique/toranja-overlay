const APP_COMMANDS: &[&str] = &[
    "validate_overlay_url",
    "get_overlay_state",
    "get_saved_url",
    "save_overlay_url",
    "start_overlay",
    "stop_overlay",
    "set_overlay_click_through",
    "set_overlay_edit_mode",
    "set_overlay_always_on_top",
    "set_overlay_opacity",
    "set_overlay_transparent_background",
    "set_overlay_visibility",
    "set_overlay_bounds",
    "save_overlay_position",
    "reset_overlay_position",
    "update_automation_settings",
    "recover_overlay",
    "open_social_stream_site",
];

fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .app_manifest(tauri_build::AppManifest::new().commands(APP_COMMANDS)),
    )
    .expect("failed to run tauri-build");
}
