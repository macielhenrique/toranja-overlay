# Relatório Técnico — Toranja Overlay (PoC Tauri 2 + Interface do Figma)

Data de atualização: **20/11/2026**  
Escopo: prova de conceito Tauri 2 + implementação completa das 4 telas do Figma, persistência local, detecção real de processo do OBS Studio e inicialização independente com o Windows em `apps/desktop`.

---

## 1. Ambiente e Dependências Verificadas

### Ferramentas do sistema Windows

| Dependência | Situação | Versão / Detalhe observado |
| :--- | :--- | :--- |
| Node.js | Instalado | `v24.18.0` |
| npm | Instalado | `11.16.0` (sem uso de `pnpm`) |
| Git | Instalado | `2.56.0.windows.4` |
| rustup | Instalado | `1.29.3 (edbc831ce 2026-11-02)` em `%USERPROFILE%\.cargo\bin` |
| rustc | Instalado | `1.100.0 (0ef1bc386 2026-11-09)` (`stable-x86_64-pc-windows-msvc`) |
| cargo | Instalado | `1.100.0 (3acc79c0c 2026-11-05)` |
| Microsoft C++ Build Tools | Instalado | Visual Studio Build Tools 2026 (`18.7.3+11925.98`), MSVC `14.51.36231` |
| Windows SDK | Instalado | `10.0.26100.0` |
| WebView2 Runtime | Instalado | `157.0.4341.60` (registrado em `HKLM\...\EdgeUpdate\Clients`) |

### Dependências principais (`apps/desktop`)

- **npm (`package-lock.json`):** `@tauri-apps/api 2.12.5`, `@tauri-apps/cli 2.12.6`, `input-switch-polyfill 1.12.0`, `vite 6.4.6`, `typescript 5.9.3`, `vitest 2.1.9`
- **Cargo (`src-tauri/Cargo.lock`):** `tauri 2.12.7`, `tauri-build 2.7.6`, `tauri-plugin-global-shortcut 2.4.1`, `wry 0.57.3`, `tao 0.37.3`, `webview2-com 0.39.1`, `windows-sys 0.59`, `winreg 0.56.0`, `url 2.5.8`, `serde 1.0.229`, `serde_json 1.0.154`

---

## 2. Funcionalidades Implementadas

1. **Interface oficial das 4 telas do Figma (`apps/desktop/src/`):**
   - Sidebar persistente com logotipo oficial da Toranja Tech (`toranja-symbol-orange.svg`), 4 itens de navegação e rodapé de privacidade local.
   - **Visão geral (`views/overview.ts`):** hero card laranja dinâmico, salvamento de link do Social Stream Ninja com pill de estado e validação acessível, controle rápido (`Iniciar overlay` / `Mostrar overlay` / `Ocultar` / `Encerrar`) e estado da janela (`Editar` / `Fixar` / `Recuperar`).
   - **Configurar overlay (`views/configure.ts`):** switches acessíveis (`Sempre visível`, `Permitir cliques no jogo`, `Modo edição`), controle deslizante **Opacidade do overlay** (`20%` a `100%` com atualização em tempo real na prévia e na janela do chat), seção `POSIÇÃO SALVA` (`Eixo X`, `Eixo Y`, `Tamanho`, `Salvar posição`, `Restaurar padrão`), prévia interativa do chat e card de recuperação (`Recuperar overlay`).
   - **Automação e OBS (`views/automation.ts`):** switches independentes para `Abrir quando o OBS iniciar`, `Restaurar a última posição`, `Iniciar com o Windows` e `Iniciar em modo fixo`, além do painel ao vivo de monitoramento do OBS Studio.
   - **Primeira configuração / Como começar (`views/onboarding.ts`):** fluxo em 3 passos sem conta/login com salvamento + abertura imediata e botão seguro para abrir `https://socialstream.ninja/`.

2. **Persistência local, OBS e Windows (`src-tauri/src/`):**
   - `settings.rs`: persistência atômica de configurações locais em `settings.json` (`app_config_dir`), incluindo opacidade (`20`–`100`), com sanitização de URL e clamping de geometria/opacidade na leitura.
   - `windows_integration.rs`: detecção real de processos do OBS (`obs64.exe`, `obs32.exe`, `obs.exe`) via Win32 `CreateToolhelp32Snapshot` e gerenciamento independente de inicialização automática do Windows em `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` (`--background`).
   - `overlay.rs`: comandos de manipulação/navegação de janela executados em `async fn` (evitando deadlock na thread de mensagens WebView2 do Windows), aplicação de opacidade via script numérico em `initialization_script`/`on_page_load`/`eval`, e loop de monitoramento em background (3s) disparando a abertura automática via `tauri::async_runtime::spawn`.

3. **Segurança e Isolamento:**
   - `capabilities/controller-only.json` + `build.rs` (`AppManifest`) concedendo apenas `core:event:allow-listen`, `core:event:allow-unlisten` e os 17 comandos do app exclusivamente à janela `"main"`, sem bloco `"remote"` e sem capabilities para `"overlay"`.
   - `ensure_controller_window` em todos os 17 comandos Rust, `on_navigation` restrito a `https://*.socialstream.ninja`, `on_new_window::Deny`, eventos direcionados via `emit_to("main", ...)` e isolamento da URL completa fora de `OverlayState`.

---

## 3. Resultados de Compilação e Testes Automatizados

| Verificação | Comando executado | Resultado |
| :--- | :--- | :--- |
| Testes unitários Frontend | `npm test` (Vitest `2.1.9`) em `apps/desktop` | **Passou** — 2 arquivos, **11/11** testes aprovados (`url-validator.test.ts` 7 + `navigation.test.ts` 4) |
| Typecheck + Build Frontend | `npm run build` (`tsc --noEmit && vite build`) em `apps/desktop` | **Passou** — saída em `apps/desktop/dist/` (`index.html` 1,93 kB, CSS 17,19 kB, `input-switch-polyfill` 2,98 kB, JS principal 46,53 kB) |
| Testes unitários Backend Rust | `cargo test` em `apps/desktop/src-tauri` | **Passou** — **19/19** testes aprovados (`state` 6 + `url_policy` 7 + `settings` 3 + `windows_integration` 2 + `overlay` 1) |
| Linter Rust | `cargo clippy --all-targets -- -D warnings` em `apps/desktop/src-tauri` | **Passou** — 0 erros e 0 warnings |
| Compilação Tauri Release (Windows) | `npx tauri build --no-bundle` em `apps/desktop` | **Passou** — binário gerado em `apps/desktop/src-tauri/target/release/toranja-overlay.exe` (`9.529.344` bytes) em `31.95s` |
| Auditoria de Capabilities | Leitura de `src-tauri/gen/schemas/capabilities.json` | **Confirmado** — `"local": true`, `"windows": ["main"]`, 17 comandos `allow-*` + `core:event:allow-listen`/`unlisten` |
| Smoke test de inicialização | Execução de `toranja-overlay.exe` por 4s via `Start-Process` | **Passou parcialmente (boot)** — processo permaneceu ativo (`HasExited: False`, `PID: 28188`, `MainWindowHandle: 6753330`), encerrado ao fim do teste |

---

## 4. Testes Manuais Pendentes (Sessão Interativa do Usuário)

Os itens abaixo **não** podem ser declarados aprovados sem execução visual e interativa direta no desktop Windows:

- [ ] **Primeira configuração e navegação:** abrir sem `settings.json` prévio, validar que abre em **Primeira configuração**, salvar uma URL real do Social Stream Ninja e verificar que o próximo boot abre direto em **Visão geral**.
- [ ] **Carregamento real + transparência + `always-on-top`:** confirmar que o chat carrega transparente sobre janelas normais e jogos em janela sem bordas.
- [ ] **Click-through e recuperação por atalho:** clicar através do overlay no modo fixo, alternar com `Ctrl+Shift+Alt+X` (edição/fixo) e `Ctrl+Shift+Alt+H` (mostrar/ocultar) e testar o botão **Recuperar overlay**.
- [ ] **Estabilidade após `Alt+Tab`:** alternar entre o jogo em janela sem bordas e outras janelas para confirmar se `always-on-top` e `click-through` permanecem estáveis.
- [ ] **Persistência de posição/tamanho:** mover ou salvar posição/tamanho em **Configurar overlay**, reiniciar o aplicativo e confirmar restauração exata.
- [ ] **Detecção real do OBS Studio:** habilitar `Abrir quando o OBS iniciar` com um link salvo, abrir o OBS Studio (`obs64.exe`) e confirmar se o indicador muda para `OBS detectado` e o overlay abre automaticamente.
- [ ] **Inicialização com o Windows:** ativar `Iniciar com o Windows`, reiniciar/fazer logoff ou testar o executável com `--background` e confirmar entrada em `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`.

---

## 5. Limitações Encontradas e Observações

1. **Jogos em tela cheia exclusiva:** sobreposição não garantida pelo DWM/Windows; recomendado modo janela sem bordas.
2. **Fontes externas online:** `Clash Display` e `Inter` ainda dependem de link externo quando online (com fallback local `"Segoe UI", system-ui`); empacotamento local permanece planejado para fases futuras após auditoria de licenças.
3. **Higienização aplicada:** os arquivos PNG exportados do Figma em `public/` foram descartados após a conclusão da implementação e validação do build, mantendo `docs/DESIGN-HANDOFF.md` como referência permanente.
4. **Smoke test:** `MainWindowTitle` retornou vazio na checagem de 4s do subshell automatizado e `CloseMainWindow()` não encerrou o processo dentro de 2s, exigindo `Stop-Process` ao fim do teste.
