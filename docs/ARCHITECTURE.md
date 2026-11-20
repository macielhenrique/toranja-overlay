# Arquitetura do Toranja Overlay

## Princípio de operação local

O Toranja Overlay opera **100% localmente** no computador do streamer, sem servidor remoto da Toranja Tech, sem conta, sem telemetria e sem backend proprietário. A landing page em `apps/web/` destina-se apenas à divulgação e distribuição futura.

## Desktop (`apps/desktop`)

O aplicativo desktop usa **Tauri 2** com arquitetura de janelas separadas e interface local modular em TypeScript + Vite:

1. **Controlador Local (`main`)**:
   - Shell com sidebar fixa e 4 telas oficiais descritas em `docs/DESIGN-HANDOFF.md`:
     - **Visão geral** (`src/views/overview.ts`)
     - **Configurar overlay** (`src/views/configure.ts`)
     - **Automação e OBS** (`src/views/automation.ts`)
     - **Como começar / Primeira configuração** (`src/views/onboarding.ts`)
   - Componentes reutilizáveis em `src/components/` (`sidebar.ts`, `switch-row.ts`, `status-pill.ts`), validação de URL (`url-validator.ts`) e cliente IPC tipado (`api.ts`).
   - Escuta atualizações em tempo real pelo evento direcionado `overlay-state-changed`.

2. **Janela de Overlay (`overlay`)**:
   - Criada dinamicamente via `tauri::WebviewWindowBuilder` com `WebviewUrl::External(...)` apontando exclusivamente para URLs HTTPS validadas de `socialstream.ninja` (ou subdomínios oficiais).
   - Mantida **permanentemente** sem moldura e sem sombra (`transparent(true)`, `decorations(false)`, `shadow(false)`, `resizable(false)`, `skip_taskbar(true)`, `focused(false)`) — nunca alterna `set_decorations(true)` no Windows, evitando que o DWM pinte fundo cinza opaco sobre o WebView2.
   - Aplica transparência real de fundo ("efeito espelho") e opacidade (`20%`–`100%`) por `build_overlay_appearance_script` (executado em `initialization_script`, `on_page_load(Finished)` e `eval`), removendo fundos sólidos padrão de páginas como `dock.html` e ocultando a barra inferior em modo fixo/edição sem usar `WS_EX_LAYERED` manual.
   - Os comandos Rust que criam, navegam ou alteram janelas são declarados como `async fn` para executar fora da thread principal da UI do Windows/WebView2 e evitar deadlocks.

3. **Moldura Local Temporária de Modo Edição (`overlay-editor`)**:
   - Criada apenas quando `running && visible && edit_mode` via entry point local `editor.html` (`src/editor.ts` + `src/editor.css`), sobreposta exatamente na geometria lógica/física de `overlay`.
   - Mantém o centro transparente com borda tracejada `#F38A0F`, barra superior compacta para arraste (`startDragging`), botão `Fixar` (`Esc` ou clique) e 8 alças de redimensionamento (`startResizeDragging`).
   - Eventos `Moved` e `Resized` de `overlay-editor` sincronizam posição e tamanho em tempo real com `overlay` e `OverlayState`; ao fixar, ocultar ou encerrar, `overlay-editor` é destruída automaticamente.

4. **Persistência Local (`src-tauri/src/settings.rs`)**:
   - Armazena configurações localmente em `settings.json` dentro de `app.path().app_config_dir()` com escrita atômica (`settings.json.tmp` -> `settings.json`).
   - Persiste URL validada, última geometria (`x`, `y`, `width`, `height`), `alwaysOnTop`, `opacity` (`20`–`100`), `transparentBackground`, `clickThrough`, preferências de automação (`autoOpenWithObs`, `restoreLastPosition`, `launchOnWindowsStartup`, `startPinned`) e `onboardingCompleted`.
   - Ao carregar do disco, sanitiza a URL com `url_policy::validate_overlay_url` e aplica clamping na geometria.

5. **Integração Windows e Detecção Real do OBS (`src-tauri/src/windows_integration.rs` + `overlay.rs`)**:
   - **Detecção real do OBS Studio:** thread dedicada verifica periodicamente a lista de processos do Windows via Win32 `CreateToolhelp32Snapshot` (`TH32CS_SNAPPROCESS`), `Process32FirstW` e `Process32NextW`, identificando `obs64.exe`, `obs32.exe` e `obs.exe`. Quando o OBS inicia (ou já está aberto) e a opção está ativa com URL salva, o overlay é iniciado respeitando `restoreLastPosition` e `startPinned`.
   - **Inicialização com o Windows:** opção independente que gerencia o valor `ToranjaOverlay` (`"<exe>" --background`) em `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run` via `winreg`, sem privilégios administrativos. Quando iniciado com `--background`, o controlador inicia minimizado para monitorar o OBS em segundo plano.

6. **Atalhos Globais (Backend Rust)**:
   - Registrados diretamente no backend Rust via `tauri-plugin-global-shortcut` (com execução despachada via `tauri::async_runtime::spawn` para evitar bloqueio no loop principal do Windows), sem exposição de permissões do plugin ao frontend:
     - `Ctrl + Shift + Alt + X`: alterna entre modo fixo (`click-through`) e modo edição (também exibe a janela caso esteja oculta).
     - `Ctrl + Shift + Alt + H`: alterna entre mostrar e ocultar o overlay.
   - Falhas de registro são tratadas de forma não-fatal e reportadas ao controlador via `OverlayState.shortcuts`.

## Segurança em profundidade

- **Isolamento de capabilities (`controller-only.json` e `editor-frame.json`)**:
  - `controller-only.json` aplica-se exclusivamente à janela `"main"`, sem bloco `"remote"` e sem concessão de permissões à janela `"overlay"`. Concede apenas `core:event:allow-listen`, `core:event:allow-unlisten` e os 18 comandos declarados em `apps/desktop/src-tauri/build.rs` via `tauri_build::AppManifest::new().commands(...)`.
  - `editor-frame.json` aplica-se exclusivamente à janela local `"overlay-editor"` e concede apenas `core:window:allow-start-dragging`, `core:window:allow-start-resize-dragging` e `allow-set-overlay-edit-mode`.
  - A janela remota `"overlay"` permanece com **zero** capabilities nativas.
- **Guarda de origem em runtime (`ensure_controller_window` / `ensure_controller_or_editor_window`)**:
  - Todos os 18 comandos `#[tauri::command]` verificam origem local permitida (`is_controller_origin`) e `window.label() == "main"`, exceto `set_overlay_edit_mode`, que também aceita `"overlay-editor"` exclusivamente para fixar o overlay (`edit_mode == false`).
- **Política estrita de URL e navegação (`url_policy.rs`)**:
  - Exige esquema `https://`, rejeita credenciais embutidas, rejeita portas não padrão e aceita apenas `socialstream.ninja` ou subdomínios válidos sem pontos malformados.
  - `on_navigation` bloqueia redirecionamentos top-level fora da política; `on_new_window` retorna `NewWindowResponse::Deny`.
  - Abertura externa no onboarding (`open_social_stream_site`) aceita exclusivamente a constante hardcoded `https://socialstream.ninja/`.
- **Proteção contra vazamento de sessão**:
  - A URL completa salva fica isolada em `OverlayRuntime.saved_url` e nunca é incluída no payload de `OverlayState` nem nos eventos `overlay-state-changed`; exibições e notificações recebem apenas `savedUrlSanitized` / `sanitizedOrigin` com `[sessão ocultada]`.
- **Eventos direcionados**:
  - Atualizações de estado são enviadas exclusivamente com `app.emit_to("main", "overlay-state-changed", &state)`.

## Web (`apps/web`)

`apps/web` é uma landing page estática, adequada para deploy na Vercel. Downloads só serão exibidos quando houver um release real no GitHub; nenhum arquivo ou URL de download é inventado nesta etapa.

## Distribuição (Fases futuras)

O plano para fases posteriores é gerar instalador NSIS e executável portátil para Windows x64 via GitHub Actions, com checksums SHA-256. WebView2, assinatura de código e avisos SmartScreen serão documentados e validados antes do primeiro release.
