# Toranja Overlay

Acompanhe o chat da sua transmissão diretamente sobre o jogo em um único monitor — gratuito, open source, leve e 100% local.

`Windows 10/11 x64` · `Tauri 2 + Rust` · `100% Local · Sem Login`

---

## Por que o Toranja Overlay existe?

Quem faz transmissão ao vivo usando apenas um monitor costuma enfrentar dois problemas ao tentar ler o chat do [Social Stream Ninja](https://socialstream.ninja/) durante o jogo:

1. Páginas como o `dock.html` exibem um fundo sólido cinza/escuro que tampa parte da tela e atrapalha a jogabilidade.
2. Janelas comuns do navegador capturam os cliques do mouse quando posicionadas sobre o jogo.

O **Toranja Overlay** resolve isso criando uma janela **sempre visível e verdadeiramente transparente ("efeito espelho")**, removendo fundos sólidos padrão da página de chat, ajustando a opacidade das mensagens e deixando os cliques atravessarem direto para o jogo (*click-through*).

---

## Principais recursos

- **Transparência real ("efeito espelho")**: remove o fundo sólido padrão de páginas como `dock.html` do Social Stream Ninja com o interruptor **Fundo transparente** e ajuste ao vivo de **Opacidade do overlay (`20%`–`100%`)**.
- **Modo fixo (*click-through*) e Sempre visível (`always-on-top`)**: mantém o chat visível acima das outras janelas enquanto todos os cliques do mouse vão direto para o jogo.
- **Modo edição sem moldura nativa**: exibe uma moldura transparente temporária (`overlay-editor`) com borda tracejada laranja para arrastar e redimensionar livremente pelas 8 bordas/cantos sem comprometer a transparência do Windows — basta clicar em **Fixar** ou pressionar `Esc` ao terminar.
- **Atalhos globais de recuperação**: alterne entre edição e fixação ou mostre/oculte o overlay mesmo enquanto joga ou em modo *click-through*.
- **Automação real com OBS Studio e Windows**:
  - Detecta automaticamente processos do OBS Studio em execução no Windows (`obs64.exe`, `obs32.exe`, `obs.exe`) e inicia o overlay quando configurado.
  - Opção independente para **Iniciar com o Windows** em segundo plano (`--background`) via registro do usuário atual (`HKCU`), sem privilégios administrativos.
- **100% local, privado e leve**: sem conta, sem servidor remoto, sem telemetria e sem backend proprietário. Configurações salvas localmente em `%APPDATA%\br.com.toranjatech.overlay\settings.json`. Binário nativo em Tauri 2 + Rust (~9,2 MB).

---

## Como baixar e instalar (Windows 10/11)

Baixe os arquivos oficiais na página de **[Releases](https://github.com/macielhenrique/toranja-overlay/releases)** do repositório:

| Opção | Arquivo | Indicação |
| :--- | :--- | :--- |
| **Instalador Windows (Recomendado)** | `Toranja-Overlay-0.1.0-x64-setup.exe` | Instala para o usuário atual (sem precisar de Administrador), cria atalho no Menu Iniciar e inclui desinstalador. |
| **Versão Portátil** | `Toranja-Overlay-0.1.0-x64-portable.zip` | Basta extrair a pasta e executar `toranja-overlay.exe` diretamente. |

### Instalação via Chocolatey

Se você usa o gerenciador de pacotes Chocolatey no Windows:

```powershell
choco install toranja-overlay
```

> O pacote foi submetido e está passando pelo processo oficial de moderação automatizada na [Galeria Chocolatey](https://community.chocolatey.org/packages/toranja-overlay). Assim que homologado, estará disponível para instalação direta via CLI.

### Requisitos do sistema

- **Sistema operacional:** Windows 10 ou Windows 11 (64 bits).
- **WebView2 Runtime:** já vem pré-instalado no Windows 11 e na maioria dos sistemas Windows 10 atualizados. Caso esteja ausente no Windows 10, o instalador `.exe` baixa o runtime oficial da Microsoft automaticamente.

### Aviso sobre Microsoft Defender SmartScreen e verificação SHA-256

Como o **Toranja Overlay** é um projeto open source gratuito e ainda não possui certificado comercial pago de assinatura de código (EV Code Signing), o Windows pode exibir o aviso *"O Windows protegeu o computador"*.

Se isso acontecer:

1. Clique em **Mais informações**.
2. Clique em **Executar assim mesmo**.

Você também pode conferir a integridade do arquivo baixado comparando o hash `SHA-256` oficial publicado em `SHA256SUMS.txt` no PowerShell:

```powershell
Get-FileHash -Algorithm SHA256 .\Toranja-Overlay-0.1.0-x64-setup.exe
```

---

## Como usar (3 passos)

1. **Gere seu link no Social Stream Ninja:** acesse [socialstream.ninja](https://socialstream.ninja/), inicie sua sessão e copie a URL do chat/dock (`https://socialstream.ninja/...`).
2. **Conecte no Toranja Overlay:** cole a URL no aplicativo e clique em **Iniciar overlay**.
3. **Ajuste e fixe sobre o jogo:** na aba **Configurar overlay**, posicione a janela pelo **Modo edição**, ajuste **Fundo transparente** e **Opacidade do overlay**, depois clique em **Fixar** (ou pressione `Esc`).

> **Importante sobre modos de tela em jogos:** o overlay funciona melhor com jogos em **Janela sem Bordas (Borderless Windowed)**. Jogos em **Tela Cheia Exclusiva (Exclusive Fullscreen)** assumem controle direto da saída de vídeo no Windows e não garantem exibição de janelas sobrepostas.

---

## Atalhos globais

| Atalho | Ação |
| :--- | :--- |
| `Ctrl + Shift + Alt + X` | Alterna entre **Modo fixo** (*click-through*) e **Modo edição** (também restaura visibilidade se estiver oculto). |
| `Ctrl + Shift + Alt + H` | Alterna entre **mostrar** e **ocultar** a janela do overlay. |

---

## Segurança e arquitetura

- **Isolamento da janela remota (`overlay`):** o conteúdo remoto do Social Stream Ninja roda em uma webview isolada com **zero** capabilities nativas do Tauri e navegação bloqueada para pop-ups ou domínios fora de `https://*.socialstream.ninja`.
- **Separação de privilégios:** os comandos nativos são restritos ao controlador local (`main`), enquanto a moldura temporária de edição (`overlay-editor`) recebe apenas permissão para arrastar, redimensionar e sair do modo edição.
- **Proteção contra vazamento de tokens:** o parâmetro de sessão (`?session=...`) nunca é exposto nos eventos de estado nem na visualização de origem configurada (`[sessão ocultada]`).

Para detalhes técnicos completos, consulte [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) e [SECURITY.md](SECURITY.md).

---

## Estrutura do repositório

- [`apps/desktop/`](apps/desktop/): aplicação desktop Tauri 2 (backend Rust + frontend TypeScript/Vite).
- [`apps/web/`](apps/web/): base inicial da landing page estática (futura publicação).
- [`packaging/chocolatey/`](packaging/chocolatey/): definição do pacote Chocolatey (`toranja-overlay`) para distribuição no Windows.
- [`docs/`](docs/): documentação de produto, arquitetura, design handoff, roadmap, resultados técnicos e auditoria de licenças.
- [`.github/`](.github/): templates de issue, PR e diretrizes de workflows.

> Arquivos históricos locais usados apenas como referência de transição permanecem fora do repositório público via [`.gitignore`](.gitignore).

---

## Como compilar localmente (Desenvolvimento)

### Pré-requisitos (Windows 10/11)

- **Node.js** e **npm** (o projeto utiliza `npm`, não requer `pnpm`)
- **Rust / Cargo / rustup** (toolchain estável `x86_64-pc-windows-msvc`)
- **Visual Studio Build Tools** (Desktop Development with C++ + Windows SDK)
- **Microsoft Edge WebView2 Runtime**

### Comandos

A partir de [`apps/desktop/`](apps/desktop/):

```powershell
# Instalar dependências JavaScript
npm install

# Executar testes unitários do frontend (Vitest)
npm test

# Validar TypeScript e gerar bundle frontend em dist/
npm run build

# Executar em modo desenvolvimento (Controlador + Overlay)
npm run tauri dev

# Gerar executável release e instalador NSIS
npx tauri build --bundles nsis
```

Para validar testes e linter do backend Rust em `apps/desktop/src-tauri`:

```powershell
cargo test
cargo clippy --all-targets -- -D warnings
```

---

## Documentação e comunidade

- **Visão do produto:** [docs/PRODUCT.md](docs/PRODUCT.md)
- **Arquitetura e segurança:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Design Handoff (Figma e tokens Toranja Tech):** [docs/DESIGN-HANDOFF.md](docs/DESIGN-HANDOFF.md)
- **Roadmap:** [docs/ROADMAP.md](docs/ROADMAP.md)
- **Histórico de versões:** [CHANGELOG.md](CHANGELOG.md)
- **Como contribuir:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Política de segurança:** [SECURITY.md](SECURITY.md)

## Licença

O **Toranja Overlay** é software livre licenciado sob a **[Licença MIT](LICENSE)**. O inventário completo de dependências e proveniência está documentado em [docs/LICENSING.md](docs/LICENSING.md).
