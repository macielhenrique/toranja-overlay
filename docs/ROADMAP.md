# Roadmap

## Fase 0 — reorganização e preparação

- [x] Criar a nova raiz e separar desktop, web, docs e legado.
- [x] Preservar a instalação Electron usada como fallback.
- [x] Registrar arquitetura, produto, roadmap e pendências de licenciamento.

## Fase 1 — prova de conceito Tauri

- [x] Verificar e configurar pré-requisitos do ambiente Windows (Node/npm, Rust/Cargo/rustup, MSVC Build Tools, Windows SDK e WebView2).
- [x] Criar o shell Tauri 2 para Windows em `apps/desktop` com controlador local e janela de overlay isolada.
- [x] Implementar política de URL HTTPS, isolamento por capabilities/`AppManifest`, atalhos globais (`Ctrl+Shift+Alt+X` e `Ctrl+Shift+Alt+H`) e modos Jogo/Edição.
- [x] Compilar o binário release Windows (`toranja-overlay.exe`) e executar testes automatizados e smoke test de inicialização.
- [x] Abrir uma URL real do Social Stream Ninja (`dock.html`) em sessão interativa e validar visualmente a transparência real ("efeito espelho") e o controle de opacidade.
- [ ] Validar em sessão contínua de transmissão `always-on-top` (inclusive após `Alt+Tab`), `click-through`, alternância Jogo/Edição e uso sobre jogos em janela sem bordas.

## Fase 2 — configuração, interface oficial e automação Windows

- [x] Implementar a interface oficial das 4 telas do Figma (`Visão geral`, `Configurar overlay`, `Automação e OBS` e `Primeira configuração`) com logotipos oficiais da Toranja Tech e documentação `docs/DESIGN-HANDOFF.md`.
- [x] Persistir preferências localmente em `settings.json` (URL validada, última posição/tamanho, sempre visível, opacidade, fundo transparente, click-through, automação e conclusão da primeira configuração).
- [x] Implementar detecção real de processo do OBS Studio (`obs64.exe` / `obs32.exe` / `obs.exe`) e opção independente para inicialização com o Windows (`HKCU\...\Run`).
- [ ] Validar manualmente a abertura automática ao iniciar o OBS Studio e a inicialização com o Windows em `--background`.
- [ ] Permitir personalização ou remapeamento seguro dos atalhos globais e revisar empacotamento local offline das fontes.

## Fase 3 — validação

- [ ] Testar jogos, OBS, resoluções, escalas DPI e múltiplos monitores.
- [ ] Documentar limitações de tela cheia exclusiva e decidir se um fallback Win32 de topmost é necessário caso o teste manual identifique perda de foco/Z-order.

## Fase 4 — distribuição Windows

- [x] Gerar instalador Windows NSIS (`x64`) e pacote portátil `.zip`.
- [x] Gerar checksums `SHA-256` e documentar requisitos de WebView2 e avisos do Windows Defender SmartScreen no `README.md` e nas notas de release.

## Fase 5 — publicação

- [ ] Finalizar escolha da licença pública final (ex.: MIT ou Apache-2.0) e adicionar arquivo `LICENSE` após revisão final de [docs/LICENSING.md](LICENSING.md).
- [ ] Publicar repositório e primeiro release (`v0.1.0`) no GitHub.
- [ ] Publicar a landing page em `overlay.toranjatech.com.br`.
