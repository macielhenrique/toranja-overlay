mod overlay;
mod settings;
mod state;
mod url_policy;
mod windows_integration;

use state::{OverlayRuntime, OverlayState, ShortcutStatus};
use tauri::{Manager, WindowEvent};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(OverlayRuntime::default())
        .setup(|app| {
            let loaded_settings = settings::load_settings(app.handle());
            let obs_detected = windows_integration::is_obs_process_running();
            let startup_enabled = windows_integration::is_windows_startup_enabled();
            let mut initial_state =
                OverlayState::from_persisted(&loaded_settings, obs_detected, startup_enabled);

            #[cfg(desktop)]
            {
                let toggle_mode_shortcut = Shortcut::new(
                    Some(Modifiers::CONTROL | Modifiers::SHIFT | Modifiers::ALT),
                    Code::KeyX,
                );
                let toggle_visibility_shortcut = Shortcut::new(
                    Some(Modifiers::CONTROL | Modifiers::SHIFT | Modifiers::ALT),
                    Code::KeyH,
                );

                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_handler(move |app_handle, shortcut, event| {
                            if event.state() != ShortcutState::Pressed {
                                return;
                            }

                            if shortcut == &toggle_mode_shortcut {
                                let app_clone = app_handle.clone();
                                tauri::async_runtime::spawn(async move {
                                    overlay::toggle_edit_mode_from_shortcut(&app_clone);
                                });
                            } else if shortcut == &toggle_visibility_shortcut {
                                let app_clone = app_handle.clone();
                                tauri::async_runtime::spawn(async move {
                                    overlay::toggle_visibility_from_shortcut(&app_clone);
                                });
                            }
                        })
                        .build(),
                )?;

                let toggle_mode_registered =
                    app.global_shortcut().register(toggle_mode_shortcut).is_ok();
                let toggle_visibility_registered = app
                    .global_shortcut()
                    .register(toggle_visibility_shortcut)
                    .is_ok();

                initial_state.shortcuts = ShortcutStatus {
                    toggle_mode_registered,
                    toggle_visibility_registered,
                };
            }

            {
                let runtime = app.state::<OverlayRuntime>();
                if let Ok(mut guard) = runtime.saved_url.lock() {
                    *guard = loaded_settings.saved_url;
                };
                if let Ok(mut guard) = runtime.state.lock() {
                    *guard = initial_state;
                };
            }

            if let Some(main_window) = app.get_webview_window(overlay::CONTROLLER_WINDOW_LABEL) {
                if std::env::args().any(|arg| arg == "--background") {
                    let _ = main_window.minimize();
                }

                let app_handle = app.handle().clone();
                main_window.on_window_event(move |event| {
                    if matches!(
                        event,
                        WindowEvent::CloseRequested { .. } | WindowEvent::Destroyed
                    ) {
                        overlay::close_overlay_on_controller_exit(&app_handle);
                    }
                });
            }

            overlay::start_obs_monitor(app.handle().clone());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            overlay::validate_overlay_url,
            overlay::get_overlay_state,
            overlay::get_saved_url,
            overlay::save_overlay_url,
            overlay::start_overlay,
            overlay::stop_overlay,
            overlay::set_overlay_click_through,
            overlay::set_overlay_edit_mode,
            overlay::set_overlay_always_on_top,
            overlay::set_overlay_opacity,
            overlay::set_overlay_transparent_background,
            overlay::set_overlay_visibility,
            overlay::set_overlay_bounds,
            overlay::save_overlay_position,
            overlay::reset_overlay_position,
            overlay::update_automation_settings,
            overlay::recover_overlay,
            overlay::open_social_stream_site,
        ])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o Toranja Overlay");
}
