# Changelog

## [0.1.0] - 2026-11-20

Primeira versão funcional do **Toranja Overlay** para Windows 10/11 (x64) construída com **Tauri 2 + Rust + TypeScript**.

### Adicionado

- Núcleo nativo Tauri 2 em `apps/desktop` com janela remota `overlay` isolada sem capabilities e política estrita HTTPS para `socialstream.ninja`.
- Interface oficial em 4 telas alinhada ao Figma e à identidade visual da Toranja Tech (**Visão geral**, **Configurar overlay**, **Automação e OBS** e **Como começar**).
- Transparência real ("efeito espelho") com injeção segura de estilos para remover fundos sólidos de páginas como `dock.html`, interruptor **Fundo transparente** e controle deslizante de **Opacidade do overlay (`20%`–`100%`)**.
- Moldura local transparente de **Modo edição** (`overlay-editor`) para arrastar e redimensionar pelas 8 bordas/cantos sem perder a transparência DWM no Windows, com botão **Fixar** e suporte a `Esc`.
- Alternância entre modo fixo (*click-through*), **Sempre visível (`always-on-top`)** e atalhos globais de recuperação (`Ctrl + Shift + Alt + X` e `Ctrl + Shift + Alt + H`).
- Persistência 100% local e atômica em `settings.json` (URL validada com ocultação do token de sessão na UI, geometria, opacidade, transparência e automação).
- Detecção real de processo do OBS Studio (`obs64.exe`, `obs32.exe`, `obs.exe`) e opção independente para iniciar com o Windows (`--background` via `HKCU`).
- Empacotamento para release Windows: instalador NSIS (por usuário, sem privilégios de administrador), versão portátil `.zip` e verificação `SHA-256`.

## Estrutura inicial (Fase 0)

- Estrutura inicial do produto Toranja Overlay.
- Cópia local histórica mantida fora do repositório público via `.gitignore`.
- Documentação inicial de produto, arquitetura, roadmap e licenciamento.
- Esqueleto inicial da landing page em `apps/web/`.
