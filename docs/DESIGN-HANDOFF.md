# Design Handoff — Toranja Overlay

Documento permanente de referência visual e comportamental para a interface do **Toranja Overlay**, alinhado à arquitetura Tauri 2 + Rust + TypeScript em `apps/desktop`.

## Origem do design

- **Arquivo oficial no Figma:** [Toranja Overlay | UI/UX v0.1](https://www.figma.com/design/CvhFibr2O3C9wlgPXByUGU)
- **Resolução e escala alvo:** aplicativo desktop Windows 10/11 (`width: 1120`, `height: 760`, `minWidth: 900`, `minHeight: 640`).
- **Assets oficiais de marca (não recriar manualmente):**
  - `apps/desktop/src/assets/toranja-symbol-orange.svg` (cópia de `logo-toranja 02.svg`)
  - `apps/desktop/src/assets/toranja-symbol-white.svg` (cópia de `logo-toranja 03.svg`)

## Identidade visual oficial (Toranja Tech)

| Token | Valor | Uso principal |
| :--- | :--- | :--- |
| Laranja | `#F38A0F` | Hero banner, botão primário, item ativo da sidebar, switch ativado, destaques |
| Amarelo | `#FFCD04` | Anel de foco acessível (`:focus-visible`), avisos, nomes na prévia |
| Branco | `#FFFFFF` | Títulos principais, texto em botões secundários, thumb do switch |
| Marrom Escuro | `#1E1208` | Fundo principal da área de trabalho, texto sobre fundo laranja, fundo de inputs |
| Marrom Café | `#300E00` | Texto secundário sobre o hero banner e base da paleta |
| Sidebar Café | `#2A0C00` | Fundo da barra lateral de navegação |
| Superfície Card | `#28170B` | Fundo dos cards e banners informativos |
| Borda Card | `#4D2812` | Borda padrão de cards, caixas de métrica e botões secundários |
| Switch Desativado | `#734D34` | Trilha do switch quando desativado |

### Tipografia

- **Títulos e marca (`h1`, `h2`, `.hero-title`, `.setup-title`, `.monitor-title`, `.sidebar-brand-name`):** `Clash Display` peso `600` (Semibold), com fallback para `"Segoe UI", system-ui, sans-serif`.
- **Textos, controles e rótulos:** `Inter` (`400`, `500`, `600`, `700`), com fallback para `"Segoe UI", system-ui, sans-serif`.

---

## Mapeamento das 4 Telas do Figma

| Tela no Figma | Item na Sidebar | Módulo / View | Componentes e Comandos Tauri 2 Integrados |
| :--- | :--- | :--- | :--- |
| **Tela 1 • Visão geral** (`01 / PAINEL PRINCIPAL`) | `Visão geral` | `src/views/overview.ts` | Hero banner dinâmico (`getHeroStatusCopy`), card **Link do Social Stream Ninja** (`StatusPill`, validação HTTPS `validateSocialStreamUrl`, `save_overlay_url`), card **Controle rápido** (`start_overlay`, `set_overlay_visibility`, `stop_overlay`) e card **Estado da janela** (`set_overlay_edit_mode`, `recover_overlay`). |
| **Tela 2 • Configurar overlay** (`02 / AJUSTES DA JANELA`) | `Configurar overlay` | `src/views/configure.ts` | Card **Comportamento da janela** (`SwitchRow` para `set_overlay_always_on_top`, `set_overlay_click_through`, `set_overlay_edit_mode`, `set_overlay_transparent_background`; controle deslizante **Opacidade do overlay** `20%`–`100%` ligado a `set_overlay_opacity`; seção `POSIÇÃO SALVA` com `Eixo X`, `Eixo Y`, `Tamanho` e ações `save_overlay_position` / `reset_overlay_position`), card **Prévia do overlay** (simulação interativa com fundo transparente/sólido e opacidade ao vivo), card **A janela sumiu?** (`recover_overlay`) e banner de janela sem bordas. |
| **Tela 3 • Automação e OBS** (`03 / AUTOMAÇÃO COM OBS`) | `Automação e OBS` | `src/views/automation.ts` | Card **Abertura automática** (`StatusPill` de detecção do OBS + 4 `SwitchRow` ligados a `update_automation_settings` com persistência em `settings.json`, monitor ToolHelp32 de `obs64.exe`/`obs32.exe`/`obs.exe` e registro `HKCU\...\Run`), card **MONITORAMENTO • OBS Studio**, card **Tudo fica no seu computador** e banner explicando a independência entre abrir com o OBS e iniciar com o Windows. |
| **Tela 4 • Primeira configuração** (`04 / PRIMEIRO ACESSO`) | `Como começar` | `src/views/onboarding.ts` | Coluna esquerda com 3 passos (`01 • SOCIAL STREAM NINJA`, `02 • COPIE O LINK`, `03 • PRONTO PARA JOGAR`) e coluna direita **Configure seu overlay** sem conta/login (`start_overlay` com persistência e navegação para `Visão geral`, mais `open_social_stream_site` restrito a `https://socialstream.ninja/`). |

### Componentes reutilizáveis compartilhados

- `src/components/sidebar.ts`: logotipo oficial Toranja + navegação acessível com `aria-current="page"` + rodapé de privacidade local.
- `src/components/switch-row.ts`: linha padronizada com `<input type="checkbox" switch>` (e carregamento condicional de `input-switch-polyfill` quando `!('switch' in HTMLInputElement.prototype)`).
- `src/components/status-pill.ts`: badge com indicador visual para estados `success`, `warning`, `neutral` e `error`.
- `src/form-accessibility.ts`: sincronia de `aria-invalid`, `aria-describedby` e anúncios em região `aria-live="polite"`.

---

## Regras de comportamento e segurança

1. **Rota inicial inteligente:** abre em **Primeira configuração** (`onboarding`) enquanto não houver URL salva nem conclusão de configuração; caso contrário abre diretamente em **Visão geral** (`overview`).
2. **Persistência 100% local:** URL validada, última geometria (`savedX`, `savedY`, `savedWidth`, `savedHeight`), opacidade (`opacity` entre `20` e `100`), fundo transparente (`transparentBackground`), preferências de comportamento e automação são gravadas atomicamente em `settings.json` no `app_config_dir()` do usuário.
3. **Isolamento de segurança e transparência real:** a webview remota (`overlay`) permanece sempre sem decorações nem sombra (`transparent(true)`, `decorations(false)`, `shadow(false)`) e não recebe nenhuma capability nativa; durante o modo edição, a moldura local `overlay-editor` (`editor.html`) é exibida sobre ela com capability dedicada (`editor-frame.json`) restrita a arrastar, redimensionar e fixar (`set_overlay_edit_mode(false)`). Todos os 18 comandos Rust validam origem local (`ensure_controller_window` / `ensure_controller_or_editor_window`), `on_navigation` restringe navegações a `https://*.socialstream.ninja`, `on_new_window` nega pop-ups e eventos de estado usam `emit_to("main", ...)` sem expor tokens de sessão. Comandos que manipulam/navegam janelas rodam em `async fn` para evitar deadlock no loop de mensagens WebView2 no Windows.
4. **Recuperação garantida:** durante modo `click-through`, o usuário pode recuperar a janela visível e interativa via `Ctrl + Shift + Alt + X` (edição/fixação), `Ctrl + Shift + Alt + H` (mostrar/ocultar) ou pelo botão **Recuperar overlay**.
5. **Detecção real do OBS e autostart Windows independentes:** `Abrir quando o OBS iniciar` detecta `obs64.exe` / `obs32.exe` / `obs.exe` via Win32 ToolHelp32; `Iniciar com o Windows` grava/remove separadamente a entrada `ToranjaOverlay` (`--background`) em `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`.

## Critérios de aceite

- Navegação fluida entre as 4 telas preservando o link digitado em rascunho.
- Validação acessível de URL (bloqueio de HTTP, hosts não autorizados e portas customizadas) e ocultação de `?session=...` em exibições e eventos.
- Persistência real de URL, posição, tamanho e automação após reiniciar o aplicativo.
- Detecção real de OBS Studio em execução no Windows abrindo o overlay automaticamente quando habilitada.
- Alternância entre modo fixado (`click-through`) e modo edição funcional tanto pelos controles da UI quanto pelos atalhos globais.
