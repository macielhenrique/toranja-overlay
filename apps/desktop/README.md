# Toranja Overlay — Desktop (Tauri 2)

Aplicativo desktop em Tauri 2 (Rust + TypeScript + Vite) para exibir o chat do Social Stream Ninja em uma janela transparente ("efeito espelho") sobre outros programas e jogos no Windows 10/11.

## Pré-requisitos verificados

- **Node.js** `v24.18.0` e **npm** `11.16.0` (sem necessidade de `pnpm`)
- **Rust / Cargo / rustup** (`rustc 1.100.0`, `cargo 1.100.0`, `rustup 1.29.3`, toolchain `stable-x86_64-pc-windows-msvc`)
- **Visual Studio Build Tools 2026** (`18.7.3`) com MSVC `14.51.36231` e **Windows SDK** `10.0.26100.0`
- **Microsoft Edge WebView2 Runtime** (`157.0.4341.60`)

## Telas e funcionalidades

- **Visão geral:** painel com status ao vivo, salvamento local do link do Social Stream Ninja e controles rápidos de exibição/edição.
- **Configurar overlay:** switches de `Sempre visível`, `Permitir cliques no jogo` (`click-through`), `Modo edição` (com moldura local transparente `overlay-editor`), `Fundo transparente` (remoção de fundo sólido do `dock.html`), controle deslizante de **Opacidade do overlay** (`20%`–`100%`), geometria salva (`Eixo X`, `Eixo Y`, `Tamanho`), prévia simulada e recuperação do overlay.
- **Automação e OBS:** detecção real de processos do OBS Studio (`obs64.exe`, `obs32.exe`, `obs.exe`) no Windows, restauração da última posição salva, opção independente para iniciar com o Windows (`--background`) e opção de iniciar em modo fixo.
- **Como começar (Primeira configuração):** guia em 3 passos sem conta ou login, com salvamento local e abertura rápida do Social Stream Ninja.

Consulte também `docs/DESIGN-HANDOFF.md` e `docs/ARCHITECTURE.md`.

## Comandos

Execute os comandos a partir de `apps/desktop`:

```powershell
# Instalar dependências JavaScript
npm install

# Executar testes unitários (Vitest)
npm test

# Validar TypeScript e gerar bundle frontend em dist/
npm run build

# Executar em modo de desenvolvimento (Controlador + Overlay)
npm run tauri dev

# Compilar binário release sem instalador
npx tauri build --no-bundle

# Compilar executável release + instalador Windows NSIS
npx tauri build --bundles nsis
```

Para executar diretamente os testes e o linter do backend Rust em `apps/desktop/src-tauri`:

```powershell
cargo test
cargo clippy --all-targets -- -D warnings
```

> Caso `cargo` ou `rustc` não estejam no `PATH` da sessão atual do PowerShell, adicione `$env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"`.

## Atalhos globais implementados

- `Ctrl + Shift + Alt + X`: alterna entre modo fixo (`click-through`) e modo edição (também recupera a visibilidade da janela se oculta).
- `Ctrl + Shift + Alt + H`: alterna entre mostrar e ocultar a janela do overlay.
