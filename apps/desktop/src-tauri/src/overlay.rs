use crate::settings;
use crate::state::{
    OverlayRuntime, OverlayState, DEFAULT_HEIGHT, DEFAULT_WIDTH, DEFAULT_X, DEFAULT_Y, MAX_HEIGHT,
    MAX_OPACITY, MAX_POS, MAX_WIDTH, MIN_HEIGHT, MIN_OPACITY, MIN_POS, MIN_WIDTH,
};
use crate::url_policy::{is_controller_origin, validate_overlay_url as validate_url_policy};
use crate::windows_integration::{
    is_obs_process_running, open_official_social_stream_website, sync_windows_startup,
};
use std::sync::atomic::Ordering;
use std::time::Duration;
use tauri::webview::{NewWindowResponse, PageLoadEvent};
use tauri::{
    AppHandle, Emitter, LogicalPosition, LogicalSize, Manager, Position, Size, State, WebviewUrl,
    WebviewWindow, WebviewWindowBuilder, WindowEvent,
};

pub const CONTROLLER_WINDOW_LABEL: &str = "main";
pub const OVERLAY_WINDOW_LABEL: &str = "overlay";
pub const EDITOR_WINDOW_LABEL: &str = "overlay-editor";
pub const STATE_EVENT_NAME: &str = "overlay-state-changed";

fn lock_state(runtime: &OverlayRuntime) -> Result<std::sync::MutexGuard<'_, OverlayState>, String> {
    runtime
        .state
        .lock()
        .map_err(|_| "Falha interna ao acessar o estado do overlay.".to_string())
}

fn lock_saved_url(
    runtime: &OverlayRuntime,
) -> Result<std::sync::MutexGuard<'_, Option<String>>, String> {
    runtime
        .saved_url
        .lock()
        .map_err(|_| "Falha interna ao acessar a URL salva.".to_string())
}

fn ensure_controller_window(window: &WebviewWindow) -> Result<(), String> {
    if window.label() != CONTROLLER_WINDOW_LABEL {
        return Err(
            "Acesso negado: comandos nativos são restritos ao controlador local.".to_string(),
        );
    }

    let current_url = window
        .url()
        .map_err(|_| "Não foi possível verificar a origem da janela solicitante.".to_string())?;

    if !is_controller_origin(&current_url) {
        return Err(
            "Acesso negado: origem não autorizada para invocar comandos nativos.".to_string(),
        );
    }

    Ok(())
}

fn ensure_controller_or_editor_window(window: &WebviewWindow) -> Result<(), String> {
    let label = window.label();
    if label != CONTROLLER_WINDOW_LABEL && label != EDITOR_WINDOW_LABEL {
        return Err(
            "Acesso negado: comando restrito às janelas locais autorizadas.".to_string(),
        );
    }

    let current_url = window
        .url()
        .map_err(|_| "Não foi possível verificar a origem da janela solicitante.".to_string())?;

    if !is_controller_origin(&current_url) {
        return Err(
            "Acesso negado: origem não autorizada para invocar comandos nativos.".to_string(),
        );
    }

    Ok(())
}

pub fn emit_state_to_controller(app: &AppHandle, state: &OverlayState) {
    let _ = app.emit_to(CONTROLLER_WINDOW_LABEL, STATE_EVENT_NAME, state);
}

pub fn persist_current_state(app: &AppHandle, runtime: &OverlayRuntime) {
    let snapshot = {
        let Ok(guard) = runtime.state.lock() else {
            return;
        };
        guard.clone()
    };
    let saved_url = {
        let Ok(guard) = runtime.saved_url.lock() else {
            return;
        };
        guard.clone()
    };

    let _ = settings::save_settings(app, &snapshot.to_persisted(saved_url));
}

fn apply_window_bounds(window: &WebviewWindow, state: &OverlayState) -> Result<(), String> {
    window
        .set_position(Position::Logical(LogicalPosition::new(
            f64::from(state.x),
            f64::from(state.y),
        )))
        .map_err(|e| format!("Não foi possível posicionar o overlay: {e}"))?;

    window
        .set_size(Size::Logical(LogicalSize::new(
            f64::from(state.width),
            f64::from(state.height),
        )))
        .map_err(|e| format!("Não foi possível redimensionar o overlay: {e}"))?;

    Ok(())
}

pub fn should_hide_dock_chrome(state: &OverlayState) -> bool {
    state.transparent_background && (state.click_through || state.edit_mode)
}

pub fn build_overlay_appearance_script(
    opacity: u8,
    transparent_background: bool,
    hide_dock_chrome: bool,
) -> String {
    let clamped = opacity.clamp(MIN_OPACITY, MAX_OPACITY);
    let alpha = f64::from(clamped) / 100.0;

    let mut css = String::new();
    if transparent_background {
        css.push_str(
            ":root {\n\
               --background-color: transparent !important;\n\
               --topbar-background: transparent !important;\n\
               --menu-background-color: rgba(0, 0, 0, 0.35) !important;\n\
               --menu-border-color: none !important;\n\
               --scrollbar-visible: none !important;\n\
             }\n\
             html, body, body#main {\n\
               background: transparent !important;\n\
               background-color: transparent !important;\n\
               background-image: none !important;\n\
               box-shadow: none !important;\n\
               scrollbar-width: none !important;\n\
               -ms-overflow-style: none !important;\n\
             }\n\
             html::-webkit-scrollbar, body::-webkit-scrollbar, #output::-webkit-scrollbar, .output::-webkit-scrollbar {\n\
               display: none !important;\n\
               width: 0 !important;\n\
               height: 0 !important;\n\
             }\n",
        );
        if hide_dock_chrome {
            css.push_str(
                "#menu, #TipRightClick, #backToLive { display: none !important; }\n\
                 #output { margin-bottom: 0 !important; }\n",
            );
        }
    }

    let css_literal = serde_json::to_string(&css).unwrap_or_else(|_| "\"\"".to_string());
    let transparent_flag = if transparent_background {
        "true"
    } else {
        "false"
    };

    format!(
        "(() => {{ \
            const apply = () => {{ \
                const root = document.documentElement; \
                if (!root) {{ return; }} \
                const transparentBg = {transparent_flag}; \
                const cssText = {css_literal}; \
                let styleEl = document.getElementById('toranja-overlay-style'); \
                if (!styleEl) {{ \
                    styleEl = document.createElement('style'); \
                    styleEl.id = 'toranja-overlay-style'; \
                    (document.head || root).appendChild(styleEl); \
                }} \
                if (styleEl.textContent !== cssText) {{ \
                    styleEl.textContent = cssText; \
                }} \
                root.style.transition = 'opacity 100ms ease'; \
                root.style.opacity = '{alpha:.2}'; \
                if (transparentBg) {{ \
                    root.style.setProperty('--background-color', 'transparent', 'important'); \
                    root.style.setProperty('--topbar-background', 'transparent', 'important'); \
                    root.style.setProperty('--scrollbar-visible', 'none', 'important'); \
                    root.style.setProperty('background', 'transparent', 'important'); \
                    root.style.setProperty('background-color', 'transparent', 'important'); \
                    if (document.body) {{ \
                        document.body.style.setProperty('background', 'transparent', 'important'); \
                        document.body.style.setProperty('background-color', 'transparent', 'important'); \
                        document.body.style.setProperty('background-image', 'none', 'important'); \
                    }} \
                }} else {{ \
                    root.style.removeProperty('--background-color'); \
                    root.style.removeProperty('--topbar-background'); \
                    root.style.removeProperty('--scrollbar-visible'); \
                    root.style.removeProperty('background'); \
                    root.style.removeProperty('background-color'); \
                    if (document.body) {{ \
                        document.body.style.removeProperty('background'); \
                        document.body.style.removeProperty('background-color'); \
                        document.body.style.removeProperty('background-image'); \
                    }} \
                }} \
            }}; \
            apply(); \
            if (document.readyState !== 'complete') {{ \
                document.addEventListener('DOMContentLoaded', apply, {{ once: true }}); \
                window.addEventListener('load', apply, {{ once: true }}); \
                if (window.__toranjaApplyTimer) {{ \
                    clearTimeout(window.__toranjaApplyTimer); \
                }} \
                window.__toranjaApplyTimer = setTimeout(apply, 350); \
            }} \
        }})();"
    )
}

fn apply_window_appearance(window: &WebviewWindow, state: &OverlayState) {
    let script = build_overlay_appearance_script(
        state.opacity,
        state.transparent_background,
        should_hide_dock_chrome(state),
    );
    let _ = window.eval(script);
}

fn apply_window_mode(window: &WebviewWindow, state: &OverlayState) -> Result<(), String> {
    // Janela remota permanece sempre sem decorações nem sombra para preservar transparência DWM no Windows.
    window
        .set_always_on_top(state.always_on_top)
        .map_err(|e| format!("Não foi possível aplicar always-on-top: {e}"))?;
    let ignore_cursor = state.click_through || state.edit_mode;
    window
        .set_ignore_cursor_events(ignore_cursor)
        .map_err(|e| format!("Não foi possível configurar passagem de cliques: {e}"))?;

    if state.visible {
        window
            .show()
            .map_err(|e| format!("Não foi possível exibir o overlay: {e}"))?;
    } else {
        window
            .hide()
            .map_err(|e| format!("Não foi possível ocultar o overlay: {e}"))?;
    }

    apply_window_appearance(window, state);
    Ok(())
}

fn destroy_editor_frame(app: &AppHandle) {
    if let Some(editor_window) = app.get_webview_window(EDITOR_WINDOW_LABEL) {
        let _ = editor_window.destroy();
    }
}

fn attach_editor_window_events(editor_window: &WebviewWindow, app: AppHandle) {
    let tracked_editor = editor_window.clone();
    editor_window.on_window_event(move |event| match event {
        WindowEvent::Moved(phys_pos) => {
            if phys_pos.x <= -30_000 || phys_pos.y <= -30_000 {
                return;
            }
            let scale = tracked_editor.scale_factor().unwrap_or(1.0);
            let logical = phys_pos.to_logical::<f64>(scale);
            let next_x = (logical.x.round() as i32).clamp(MIN_POS, MAX_POS);
            let next_y = (logical.y.round() as i32).clamp(MIN_POS, MAX_POS);

            let snapshot = {
                let runtime = app.state::<OverlayRuntime>();
                let Ok(mut state) = runtime.state.lock() else {
                    return;
                };
                if !state.running
                    || !state.visible
                    || !state.edit_mode
                    || (state.x == next_x && state.y == next_y)
                {
                    return;
                }
                state.x = next_x;
                state.y = next_y;
                state.saved_x = next_x;
                state.saved_y = next_y;
                state.clone()
            };

            if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
                let _ = overlay_window.set_position(Position::Physical(*phys_pos));
            }

            emit_state_to_controller(&app, &snapshot);
        }
        WindowEvent::Resized(phys_size) => {
            if phys_size.width == 0 || phys_size.height == 0 {
                return;
            }
            let scale = tracked_editor.scale_factor().unwrap_or(1.0);
            let logical = phys_size.to_logical::<f64>(scale);
            let raw_w = logical.width.round() as u32;
            let raw_h = logical.height.round() as u32;
            let next_w = raw_w.clamp(MIN_WIDTH, MAX_WIDTH);
            let next_h = raw_h.clamp(MIN_HEIGHT, MAX_HEIGHT);

            let snapshot = {
                let runtime = app.state::<OverlayRuntime>();
                let Ok(mut state) = runtime.state.lock() else {
                    return;
                };
                if !state.running
                    || !state.visible
                    || !state.edit_mode
                    || (state.width == next_w && state.height == next_h)
                {
                    return;
                }
                state.width = next_w;
                state.height = next_h;
                state.saved_width = next_w;
                state.saved_height = next_h;
                state.clone()
            };

            if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
                if raw_w == next_w && raw_h == next_h {
                    let _ = overlay_window.set_size(Size::Physical(*phys_size));
                } else {
                    let _ = overlay_window.set_size(Size::Logical(LogicalSize::new(
                        f64::from(next_w),
                        f64::from(next_h),
                    )));
                }
            }

            emit_state_to_controller(&app, &snapshot);
        }
        WindowEvent::CloseRequested { api, .. } => {
            api.prevent_close();
            let runtime = app.state::<OverlayRuntime>();
            let snapshot = {
                let Ok(mut state) = runtime.state.lock() else {
                    return;
                };
                state.set_edit_mode(false);
                state.clone()
            };

            if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
                let _ = apply_window_mode(&overlay_window, &snapshot);
            }

            persist_current_state(&app, &runtime);
            emit_state_to_controller(&app, &snapshot);

            let app_clone = app.clone();
            tauri::async_runtime::spawn(async move {
                let should_destroy = {
                    let runtime = app_clone.state::<OverlayRuntime>();
                    runtime
                        .state
                        .lock()
                        .map(|s| !s.running || !s.visible || !s.edit_mode)
                        .unwrap_or(true)
                };
                if should_destroy {
                    destroy_editor_frame(&app_clone);
                }
            });
        }
        _ => {}
    });
}

fn sync_editor_frame(app: &AppHandle, state: &OverlayState) -> Result<(), String> {
    if !(state.running && state.visible && state.edit_mode) {
        destroy_editor_frame(app);
        return Ok(());
    }

    if let Some(existing_editor) = app.get_webview_window(EDITOR_WINDOW_LABEL) {
        apply_window_bounds(&existing_editor, state)?;
        existing_editor
            .set_always_on_top(state.always_on_top)
            .map_err(|e| format!("Não foi possível manter a moldura de edição visível: {e}"))?;
        existing_editor
            .show()
            .map_err(|e| format!("Não foi possível exibir a moldura de edição: {e}"))?;
        let _ = existing_editor.set_focus();
        return Ok(());
    }

    let editor_window = WebviewWindowBuilder::new(
        app,
        EDITOR_WINDOW_LABEL,
        WebviewUrl::App("editor.html".into()),
    )
    .title("Toranja Overlay — Modo de Edição")
    .position(f64::from(state.x), f64::from(state.y))
    .inner_size(f64::from(state.width), f64::from(state.height))
    .min_inner_size(f64::from(MIN_WIDTH), f64::from(MIN_HEIGHT))
    .transparent(true)
    .decorations(false)
    .shadow(false)
    .resizable(true)
    .always_on_top(state.always_on_top)
    .skip_taskbar(true)
    .focused(true)
    .visible(true)
    .build()
    .map_err(|e| format!("Não foi possível abrir a moldura de edição do overlay: {e}"))?;

    attach_editor_window_events(&editor_window, app.clone());
    Ok(())
}

fn attach_overlay_window_events(overlay_window: &WebviewWindow, app: AppHandle) {
    let tracked_window = overlay_window.clone();
    overlay_window.on_window_event(move |event| match event {
        WindowEvent::Moved(phys_pos) => {
            if phys_pos.x <= -30_000 || phys_pos.y <= -30_000 {
                return;
            }
            let scale = tracked_window.scale_factor().unwrap_or(1.0);
            let logical = phys_pos.to_logical::<f64>(scale);
            let next_x = (logical.x.round() as i32).clamp(MIN_POS, MAX_POS);
            let next_y = (logical.y.round() as i32).clamp(MIN_POS, MAX_POS);

            let snapshot = {
                let runtime = app.state::<OverlayRuntime>();
                let Ok(mut state) = runtime.state.lock() else {
                    return;
                };
                if !state.running
                    || !state.visible
                    || state.edit_mode
                    || (state.x == next_x && state.y == next_y)
                {
                    return;
                }
                state.x = next_x;
                state.y = next_y;
                state.saved_x = next_x;
                state.saved_y = next_y;
                state.clone()
            };

            emit_state_to_controller(&app, &snapshot);
        }
        WindowEvent::Resized(phys_size) => {
            if phys_size.width == 0 || phys_size.height == 0 {
                return;
            }
            let scale = tracked_window.scale_factor().unwrap_or(1.0);
            let logical = phys_size.to_logical::<f64>(scale);
            let next_w = (logical.width.round() as u32).clamp(MIN_WIDTH, MAX_WIDTH);
            let next_h = (logical.height.round() as u32).clamp(MIN_HEIGHT, MAX_HEIGHT);

            let snapshot = {
                let runtime = app.state::<OverlayRuntime>();
                let Ok(mut state) = runtime.state.lock() else {
                    return;
                };
                if !state.running
                    || !state.visible
                    || state.edit_mode
                    || (state.width == next_w && state.height == next_h)
                {
                    return;
                }
                state.width = next_w;
                state.height = next_h;
                state.saved_width = next_w;
                state.saved_height = next_h;
                state.clone()
            };

            emit_state_to_controller(&app, &snapshot);
        }
        WindowEvent::Destroyed => {
            destroy_editor_frame(&app);

            let runtime = app.state::<OverlayRuntime>();
            let snapshot = {
                let Ok(mut state) = runtime.state.lock() else {
                    return;
                };
                if !state.running {
                    return;
                }
                state.mark_stopped();
                state.clone()
            };

            persist_current_state(&app, &runtime);
            emit_state_to_controller(&app, &snapshot);
        }
        _ => {}
    });
}

#[allow(clippy::too_many_arguments)]
pub fn launch_or_update_overlay(
    app: &AppHandle,
    runtime: &OverlayRuntime,
    raw_url: &str,
    x: i32,
    y: i32,
    width: u32,
    height: u32,
    force_pinned: Option<bool>,
) -> Result<OverlayState, String> {
    let validated = validate_url_policy(raw_url)?;
    let normalized_url = validated.url.to_string();
    let sanitized_display = validated.sanitized_display.clone();

    {
        let mut saved_url_guard = lock_saved_url(runtime)?;
        *saved_url_guard = Some(normalized_url);
    }

    let snapshot = {
        let mut state = lock_state(runtime)?;
        state.apply_saved_position(x, y, width, height);
        if let Some(pinned) = force_pinned {
            state.set_edit_mode(!pinned);
        }
        state.saved_url_configured = true;
        state.saved_url_sanitized = Some(sanitized_display.clone());
        state.onboarding_completed = true;
        state.mark_started(sanitized_display);
        state.clone()
    };

    if let Some(existing) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        existing
            .navigate(validated.url)
            .map_err(|e| format!("Não foi possível navegar o overlay para a URL informada: {e}"))?;
        apply_window_bounds(&existing, &snapshot)?;
        apply_window_mode(&existing, &snapshot)?;
        sync_editor_frame(app, &snapshot)?;
    } else {
        let app_for_load = app.clone();
        let overlay_window = WebviewWindowBuilder::new(
            app,
            OVERLAY_WINDOW_LABEL,
            WebviewUrl::External(validated.url),
        )
        .title("Toranja Overlay")
        .position(f64::from(snapshot.x), f64::from(snapshot.y))
        .inner_size(f64::from(snapshot.width), f64::from(snapshot.height))
        .transparent(true)
        .decorations(false)
        .shadow(false)
        .always_on_top(snapshot.always_on_top)
        .skip_taskbar(true)
        .resizable(false)
        .focused(false)
        .visible(true)
        .initialization_script(build_overlay_appearance_script(
            snapshot.opacity,
            snapshot.transparent_background,
            should_hide_dock_chrome(&snapshot),
        ))
        .on_page_load(move |webview_win, payload| {
            if matches!(payload.event(), PageLoadEvent::Finished) {
                let current_state = app_for_load
                    .state::<OverlayRuntime>()
                    .state
                    .lock()
                    .map(|s| s.clone())
                    .unwrap_or_default();
                apply_window_appearance(&webview_win, &current_state);
            }
        })
        .on_navigation(|target_url| validate_url_policy(target_url.as_str()).is_ok())
        .on_new_window(|_url, _features| NewWindowResponse::Deny)
        .build()
        .map_err(|e| {
            if let Ok(mut state) = runtime.state.lock() {
                state.mark_stopped();
            }
            format!("Não foi possível criar a janela do overlay: {e}")
        })?;

        overlay_window
            .set_ignore_cursor_events(snapshot.click_through || snapshot.edit_mode)
            .map_err(|e| format!("Não foi possível aplicar click-through inicial: {e}"))?;
        overlay_window
            .set_always_on_top(snapshot.always_on_top)
            .map_err(|e| format!("Não foi possível aplicar always-on-top inicial: {e}"))?;
        apply_window_appearance(&overlay_window, &snapshot);

        attach_overlay_window_events(&overlay_window, app.clone());
        sync_editor_frame(app, &snapshot)?;
    }

    persist_current_state(app, runtime);
    emit_state_to_controller(app, &snapshot);
    Ok(snapshot)
}

pub fn auto_start_overlay_from_obs(app: &AppHandle) {
    let runtime = app.state::<OverlayRuntime>();
    let saved_url = {
        let Ok(guard) = runtime.saved_url.lock() else {
            return;
        };
        guard.clone()
    };

    let Some(url) = saved_url else {
        return;
    };

    let (should_start, x, y, width, height, start_pinned) = {
        let Ok(state) = runtime.state.lock() else {
            return;
        };
        if state.running || !state.auto_open_with_obs {
            return;
        }
        let (x, y, width, height) = if state.restore_last_position {
            (
                state.saved_x,
                state.saved_y,
                state.saved_width,
                state.saved_height,
            )
        } else {
            (DEFAULT_X, DEFAULT_Y, DEFAULT_WIDTH, DEFAULT_HEIGHT)
        };
        (true, x, y, width, height, state.start_pinned)
    };

    if should_start {
        let _ = launch_or_update_overlay(
            app,
            &runtime,
            &url,
            x,
            y,
            width,
            height,
            Some(start_pinned),
        );
    }
}

pub fn start_obs_monitor(app: AppHandle) {
    if !cfg!(windows) {
        return;
    }

    std::thread::spawn(move || {
        loop {
            let stop_flag = {
                let runtime = app.state::<OverlayRuntime>();
                runtime.stop_obs_monitor.clone()
            };

            if stop_flag.load(Ordering::Relaxed) {
                break;
            }

            let detected = is_obs_process_running();
            let runtime = app.state::<OverlayRuntime>();

            if !detected {
                runtime
                    .obs_auto_opened_this_session
                    .store(false, Ordering::Relaxed);
            }

            let (changed_snapshot, should_auto_open) = {
                let Ok(mut state) = runtime.state.lock() else {
                    break;
                };
                let changed = state.obs_detected != detected;
                if changed {
                    state.obs_detected = detected;
                }

                let trigger_auto = detected
                    && state.auto_open_with_obs
                    && !state.running
                    && state.saved_url_configured
                    && !runtime
                        .obs_auto_opened_this_session
                        .load(Ordering::Relaxed);

                (
                    if changed { Some(state.clone()) } else { None },
                    trigger_auto,
                )
            };

            if let Some(snapshot) = changed_snapshot {
                emit_state_to_controller(&app, &snapshot);
            }

            if should_auto_open {
                runtime
                    .obs_auto_opened_this_session
                    .store(true, Ordering::Relaxed);
                let app_clone = app.clone();
                tauri::async_runtime::spawn(async move {
                    auto_start_overlay_from_obs(&app_clone);
                });
            }

            for _ in 0..12 {
                if stop_flag.load(Ordering::Relaxed) {
                    return;
                }
                std::thread::sleep(Duration::from_millis(250));
            }
        }
    });
}

pub fn toggle_edit_mode_from_shortcut(app: &AppHandle) {
    let runtime = app.state::<OverlayRuntime>();
    let snapshot = {
        let Ok(mut state) = runtime.state.lock() else {
            return;
        };
        let next_edit_mode = !state.edit_mode;
        state.set_edit_mode(next_edit_mode);
        if next_edit_mode && state.running && !state.visible {
            state.visible = true;
        }
        state.clone()
    };

    if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        let _ = apply_window_mode(&overlay_window, &snapshot);
    }
    let _ = sync_editor_frame(app, &snapshot);

    if !snapshot.edit_mode {
        persist_current_state(app, &runtime);
    }

    emit_state_to_controller(app, &snapshot);
}

pub fn toggle_visibility_from_shortcut(app: &AppHandle) {
    let snapshot = {
        let runtime = app.state::<OverlayRuntime>();
        let Ok(mut state) = runtime.state.lock() else {
            return;
        };
        if !state.running {
            return;
        }
        state.visible = !state.visible;
        state.clone()
    };

    if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        let _ = apply_window_mode(&overlay_window, &snapshot);
    }
    let _ = sync_editor_frame(app, &snapshot);

    emit_state_to_controller(app, &snapshot);
}

pub fn close_overlay_on_controller_exit(app: &AppHandle) {
    let runtime = app.state::<OverlayRuntime>();
    runtime.stop_obs_monitor.store(true, Ordering::Relaxed);
    persist_current_state(app, &runtime);

    destroy_editor_frame(app);
    if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        let _ = overlay_window.destroy();
    }
}

#[tauri::command]
pub fn validate_overlay_url(window: WebviewWindow, url: String) -> Result<String, String> {
    ensure_controller_window(&window)?;
    let validated = validate_url_policy(&url)?;
    Ok(validated.sanitized_display)
}

#[tauri::command]
pub fn get_overlay_state(
    window: WebviewWindow,
    runtime: State<'_, OverlayRuntime>,
) -> Result<OverlayState, String> {
    ensure_controller_window(&window)?;
    let state = lock_state(&runtime)?;
    Ok(state.clone())
}

#[tauri::command]
pub fn get_saved_url(
    window: WebviewWindow,
    runtime: State<'_, OverlayRuntime>,
) -> Result<Option<String>, String> {
    ensure_controller_window(&window)?;
    let guard = lock_saved_url(&runtime)?;
    Ok(guard.clone())
}

#[tauri::command]
pub async fn save_overlay_url(
    window: WebviewWindow,
    app: AppHandle,
    runtime: State<'_, OverlayRuntime>,
    url: String,
) -> Result<OverlayState, String> {
    ensure_controller_window(&window)?;
    let validated = validate_url_policy(&url)?;
    let normalized = validated.url.to_string();

    {
        let mut guard = lock_saved_url(&runtime)?;
        *guard = Some(normalized);
    }

    let snapshot = {
        let mut state = lock_state(&runtime)?;
        state.saved_url_configured = true;
        state.saved_url_sanitized = Some(validated.sanitized_display.clone());
        state.onboarding_completed = true;
        if state.running {
            state.sanitized_origin = Some(validated.sanitized_display);
        }
        state.clone()
    };

    persist_current_state(&app, &runtime);
    emit_state_to_controller(&app, &snapshot);

    if snapshot.running {
        if let Some(existing) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
            existing.navigate(validated.url).map_err(|e| {
                format!("Link salvo, mas não foi possível atualizar a janela ativa: {e}")
            })?;
            apply_window_appearance(&existing, &snapshot);
        }
    }

    Ok(snapshot)
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn start_overlay(
    window: WebviewWindow,
    app: AppHandle,
    runtime: State<'_, OverlayRuntime>,
    url: Option<String>,
    x: Option<i32>,
    y: Option<i32>,
    width: Option<u32>,
    height: Option<u32>,
) -> Result<OverlayState, String> {
    ensure_controller_window(&window)?;

    let resolved_url = match url {
        Some(raw) if !raw.trim().is_empty() => raw,
        _ => {
            let guard = lock_saved_url(&runtime)?;
            guard.clone().ok_or_else(|| {
                "Salve uma URL válida do Social Stream Ninja antes de iniciar o overlay."
                    .to_string()
            })?
        }
    };

    let (was_running, default_x, default_y, default_w, default_h, start_pinned) = {
        let state = lock_state(&runtime)?;
        let (dx, dy, dw, dh) = if state.restore_last_position {
            (
                state.saved_x,
                state.saved_y,
                state.saved_width,
                state.saved_height,
            )
        } else {
            (DEFAULT_X, DEFAULT_Y, DEFAULT_WIDTH, DEFAULT_HEIGHT)
        };
        (state.running, dx, dy, dw, dh, state.start_pinned)
    };

    let target_x = x.unwrap_or(default_x);
    let target_y = y.unwrap_or(default_y);
    let target_w = width.unwrap_or(default_w);
    let target_h = height.unwrap_or(default_h);
    let force_pinned = if was_running { None } else { Some(start_pinned) };

    launch_or_update_overlay(
        &app,
        &runtime,
        &resolved_url,
        target_x,
        target_y,
        target_w,
        target_h,
        force_pinned,
    )
}

#[tauri::command]
pub async fn stop_overlay(
    window: WebviewWindow,
    app: AppHandle,
    runtime: State<'_, OverlayRuntime>,
) -> Result<OverlayState, String> {
    ensure_controller_window(&window)?;

    let snapshot = {
        let mut state = lock_state(&runtime)?;
        state.mark_stopped();
        state.clone()
    };

    destroy_editor_frame(&app);

    if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        overlay_window
            .destroy()
            .map_err(|e| format!("Erro ao encerrar a janela do overlay: {e}"))?;
    }

    persist_current_state(&app, &runtime);
    emit_state_to_controller(&app, &snapshot);
    Ok(snapshot)
}

#[tauri::command]
pub async fn set_overlay_click_through(
    window: WebviewWindow,
    app: AppHandle,
    runtime: State<'_, OverlayRuntime>,
    enabled: bool,
) -> Result<OverlayState, String> {
    ensure_controller_window(&window)?;

    let snapshot = {
        let mut state = lock_state(&runtime)?;
        state.set_click_through(enabled);
        state.clone()
    };

    if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        apply_window_mode(&overlay_window, &snapshot)?;
    }
    sync_editor_frame(&app, &snapshot)?;

    persist_current_state(&app, &runtime);
    emit_state_to_controller(&app, &snapshot);
    Ok(snapshot)
}

#[tauri::command]
pub async fn set_overlay_edit_mode(
    window: WebviewWindow,
    app: AppHandle,
    runtime: State<'_, OverlayRuntime>,
    edit_mode: bool,
) -> Result<OverlayState, String> {
    ensure_controller_or_editor_window(&window)?;
    if window.label() == EDITOR_WINDOW_LABEL && edit_mode {
        return Err(
            "Acesso negado: a moldura de edição só pode fixar o overlay.".to_string(),
        );
    }

    let snapshot = {
        let mut state = lock_state(&runtime)?;
        state.set_edit_mode(edit_mode);
        if edit_mode && state.running && !state.visible {
            state.visible = true;
        }
        state.clone()
    };

    if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        apply_window_mode(&overlay_window, &snapshot)?;
    }

    if !edit_mode {
        persist_current_state(&app, &runtime);
    }

    emit_state_to_controller(&app, &snapshot);
    sync_editor_frame(&app, &snapshot)?;
    Ok(snapshot)
}

#[tauri::command]
pub async fn set_overlay_always_on_top(
    window: WebviewWindow,
    app: AppHandle,
    runtime: State<'_, OverlayRuntime>,
    enabled: bool,
) -> Result<OverlayState, String> {
    ensure_controller_window(&window)?;

    let snapshot = {
        let mut state = lock_state(&runtime)?;
        state.always_on_top = enabled;
        state.clone()
    };

    if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        overlay_window
            .set_always_on_top(snapshot.always_on_top)
            .map_err(|e| format!("Não foi possível alterar sempre visível: {e}"))?;
    }
    sync_editor_frame(&app, &snapshot)?;

    persist_current_state(&app, &runtime);
    emit_state_to_controller(&app, &snapshot);
    Ok(snapshot)
}

#[tauri::command]
pub async fn set_overlay_opacity(
    window: WebviewWindow,
    app: AppHandle,
    runtime: State<'_, OverlayRuntime>,
    opacity: u8,
    persist: Option<bool>,
) -> Result<OverlayState, String> {
    ensure_controller_window(&window)?;

    let snapshot = {
        let mut state = lock_state(&runtime)?;
        state.set_opacity(opacity);
        state.clone()
    };

    if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        apply_window_appearance(&overlay_window, &snapshot);
    }

    if persist.unwrap_or(true) {
        persist_current_state(&app, &runtime);
    }

    emit_state_to_controller(&app, &snapshot);
    Ok(snapshot)
}

#[tauri::command]
pub async fn set_overlay_transparent_background(
    window: WebviewWindow,
    app: AppHandle,
    runtime: State<'_, OverlayRuntime>,
    enabled: bool,
) -> Result<OverlayState, String> {
    ensure_controller_window(&window)?;

    let snapshot = {
        let mut state = lock_state(&runtime)?;
        state.transparent_background = enabled;
        state.clone()
    };

    if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        apply_window_appearance(&overlay_window, &snapshot);
    }

    persist_current_state(&app, &runtime);
    emit_state_to_controller(&app, &snapshot);
    Ok(snapshot)
}

#[tauri::command]
pub async fn set_overlay_visibility(
    window: WebviewWindow,
    app: AppHandle,
    runtime: State<'_, OverlayRuntime>,
    visible: bool,
) -> Result<OverlayState, String> {
    ensure_controller_window(&window)?;

    let snapshot = {
        let mut state = lock_state(&runtime)?;
        if !state.running {
            return Err("Inicie o overlay antes de alterar a visibilidade.".to_string());
        }
        state.visible = visible;
        state.clone()
    };

    if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        apply_window_mode(&overlay_window, &snapshot)?;
    }
    sync_editor_frame(&app, &snapshot)?;

    emit_state_to_controller(&app, &snapshot);
    Ok(snapshot)
}

#[tauri::command]
pub async fn set_overlay_bounds(
    window: WebviewWindow,
    app: AppHandle,
    runtime: State<'_, OverlayRuntime>,
    x: i32,
    y: i32,
    width: u32,
    height: u32,
) -> Result<OverlayState, String> {
    ensure_controller_window(&window)?;

    let snapshot = {
        let mut state = lock_state(&runtime)?;
        state.apply_bounds(x, y, width, height);
        state.clone()
    };

    if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        apply_window_bounds(&overlay_window, &snapshot)?;
    }
    sync_editor_frame(&app, &snapshot)?;

    emit_state_to_controller(&app, &snapshot);
    Ok(snapshot)
}

#[tauri::command]
pub async fn save_overlay_position(
    window: WebviewWindow,
    app: AppHandle,
    runtime: State<'_, OverlayRuntime>,
    x: i32,
    y: i32,
    width: u32,
    height: u32,
) -> Result<OverlayState, String> {
    ensure_controller_window(&window)?;

    let snapshot = {
        let mut state = lock_state(&runtime)?;
        state.apply_saved_position(x, y, width, height);
        state.clone()
    };

    if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        apply_window_bounds(&overlay_window, &snapshot)?;
    }
    sync_editor_frame(&app, &snapshot)?;

    persist_current_state(&app, &runtime);
    emit_state_to_controller(&app, &snapshot);
    Ok(snapshot)
}

#[tauri::command]
pub async fn reset_overlay_position(
    window: WebviewWindow,
    app: AppHandle,
    runtime: State<'_, OverlayRuntime>,
) -> Result<OverlayState, String> {
    ensure_controller_window(&window)?;

    let snapshot = {
        let mut state = lock_state(&runtime)?;
        state.reset_saved_position();
        state.clone()
    };

    if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
        apply_window_bounds(&overlay_window, &snapshot)?;
    }
    sync_editor_frame(&app, &snapshot)?;

    persist_current_state(&app, &runtime);
    emit_state_to_controller(&app, &snapshot);
    Ok(snapshot)
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub async fn update_automation_settings(
    window: WebviewWindow,
    app: AppHandle,
    runtime: State<'_, OverlayRuntime>,
    auto_open_with_obs: bool,
    restore_last_position: bool,
    launch_on_windows_startup: bool,
    start_pinned: bool,
) -> Result<OverlayState, String> {
    ensure_controller_window(&window)?;

    let prev_startup = {
        let state = lock_state(&runtime)?;
        state.launch_on_windows_startup
    };

    if prev_startup != launch_on_windows_startup {
        sync_windows_startup(launch_on_windows_startup)?;
    }

    let (snapshot, trigger_obs_now) = {
        let mut state = lock_state(&runtime)?;
        state.auto_open_with_obs = auto_open_with_obs;
        state.restore_last_position = restore_last_position;
        state.launch_on_windows_startup = launch_on_windows_startup;
        state.start_pinned = start_pinned;

        let trigger = auto_open_with_obs
            && state.obs_detected
            && !state.running
            && state.saved_url_configured;
        (state.clone(), trigger)
    };

    persist_current_state(&app, &runtime);
    emit_state_to_controller(&app, &snapshot);

    if trigger_obs_now {
        runtime
            .obs_auto_opened_this_session
            .store(true, Ordering::Relaxed);
        auto_start_overlay_from_obs(&app);
        let refreshed = lock_state(&runtime)?.clone();
        return Ok(refreshed);
    }

    Ok(snapshot)
}

#[tauri::command]
pub async fn recover_overlay(
    window: WebviewWindow,
    app: AppHandle,
    runtime: State<'_, OverlayRuntime>,
) -> Result<OverlayState, String> {
    ensure_controller_window(&window)?;

    let (running, saved_url) = {
        let state = lock_state(&runtime)?;
        let url = lock_saved_url(&runtime)?.clone();
        (state.running, url)
    };

    if running {
        let snapshot = {
            let mut state = lock_state(&runtime)?;
            state.visible = true;
            state.always_on_top = true;
            state.set_edit_mode(true);
            state.clone()
        };

        if let Some(overlay_window) = app.get_webview_window(OVERLAY_WINDOW_LABEL) {
            apply_window_mode(&overlay_window, &snapshot)?;
        }
        sync_editor_frame(&app, &snapshot)?;

        emit_state_to_controller(&app, &snapshot);
        return Ok(snapshot);
    }

    let Some(url) = saved_url else {
        return Err(
            "Salve um link do Social Stream Ninja antes de recuperar o overlay.".to_string(),
        );
    };

    let (x, y, width, height) = {
        let state = lock_state(&runtime)?;
        if state.restore_last_position {
            (
                state.saved_x,
                state.saved_y,
                state.saved_width,
                state.saved_height,
            )
        } else {
            (DEFAULT_X, DEFAULT_Y, DEFAULT_WIDTH, DEFAULT_HEIGHT)
        }
    };

    launch_or_update_overlay(&app, &runtime, &url, x, y, width, height, Some(false))
}

#[tauri::command]
pub fn open_social_stream_site(window: WebviewWindow) -> Result<(), String> {
    ensure_controller_window(&window)?;
    open_official_social_stream_website()
}

#[cfg(test)]
mod tests {
    use super::{build_overlay_appearance_script, should_hide_dock_chrome};
    use crate::state::OverlayState;

    #[test]
    fn appearance_script_clamps_opacity_and_injects_transparent_css() {
        let low = build_overlay_appearance_script(5, true, true);
        assert!(low.contains("'0.20'"));
        assert!(low.contains("--background-color: transparent !important"));
        assert!(low.contains("background-color: transparent !important"));
        assert!(low.contains("#menu, #TipRightClick, #backToLive { display: none !important; }"));

        let mid = build_overlay_appearance_script(75, true, false);
        assert!(mid.contains("'0.75'"));
        assert!(mid.contains("--background-color: transparent !important"));
        assert!(!mid.contains("#menu, #TipRightClick, #backToLive { display: none !important; }"));

        let opaque_bg = build_overlay_appearance_script(250, false, false);
        assert!(opaque_bg.contains("'1.00'"));
        assert!(opaque_bg.contains("const transparentBg = false;"));
        assert!(opaque_bg.contains("removeProperty('--background-color')"));
        assert!(!opaque_bg.contains("--background-color: transparent !important"));
    }

    #[test]
    fn dock_chrome_visibility_matches_transparent_and_interactive_mode() {
        let mut state = OverlayState::default();
        assert!(should_hide_dock_chrome(&state));

        state.set_edit_mode(true);
        assert!(should_hide_dock_chrome(&state));

        state.set_edit_mode(false);
        state.set_click_through(false);
        assert!(!should_hide_dock_chrome(&state));

        state.set_click_through(true);
        state.transparent_background = false;
        assert!(!should_hide_dock_chrome(&state));
    }
}
