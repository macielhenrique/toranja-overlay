# Licenciamento e proveniência

## Status da licença do produto

O **Toranja Overlay** é distribuído sob a **[Licença MIT](../LICENSE)**. O código de `apps/desktop` foi desenvolvido do zero em **Tauri 2 + Rust + TypeScript**, utilizando referências históricas apenas para entender requisitos funcionais — sem copiar nem incorporar código GPL de terceiros no novo aplicativo.

O código histórico copiado localmente em `legacy/` permanece excluído do Git público pelo `.gitignore` e não é importado nem compilado em `apps/desktop`.

---

## Auditoria de dependências (`apps/desktop`)

Verificação realizada diretamente nos manifests e lockfiles do projeto (`package.json`/`node_modules` e `cargo metadata --filter-platform x86_64-pc-windows-msvc`): **zero dependências GPL, LGPL ou AGPL** foram encontradas no aplicativo Tauri.

### Dependências diretas JavaScript / npm

| Pacote | Versão instalada | Licença | Uso |
| :--- | :--- | :--- | :--- |
| `@tauri-apps/api` | `2.12.5` | `Apache-2.0 OR MIT` | Comunicação IPC local do controlador e moldura de edição |
| `input-switch-polyfill` | `1.12.0` | `Apache-2.0` | Fallback condicional para `<input type="checkbox" switch>` |
| `@tauri-apps/cli` (dev) | `2.12.6` | `Apache-2.0 OR MIT` | CLI de build e empacotamento Tauri |
| `typescript` (dev) | `5.9.3` | `Apache-2.0` | Verificação de tipos |
| `vite` (dev) | `6.4.6` | `MIT` | Bundler do frontend local |
| `vitest` (dev) | `2.1.9` | `MIT` | Suíte de testes unitários do frontend |

### Dependências diretas Rust / Cargo (`src-tauri/Cargo.toml`)

| Crate | Versão instalada | Licença | Uso |
| :--- | :--- | :--- | :--- |
| `tauri` | `2.12.7` | `Apache-2.0 OR MIT` | Runtime desktop, webviews e janelas nativas |
| `tauri-build` (build) | `2.7.6` | `Apache-2.0 OR MIT` | Manifesto de capabilities e build script |
| `tauri-plugin-global-shortcut` | `2.4.1` | `Apache-2.0 OR MIT` | Atalhos globais registrados no backend |
| `serde` | `1.0.229` | `MIT OR Apache-2.0` | Serialização de estado e configurações locais |
| `serde_json` | `1.0.154` | `MIT OR Apache-2.0` | Leitura/escrita de `settings.json` e script de aparência |
| `url` | `2.5.8` | `MIT OR Apache-2.0` | Validação estrita da URL do overlay |
| `windows-sys` | `0.59.0` / `0.61.2` | `MIT OR Apache-2.0` | Enumeração Win32 ToolHelp32 de processos do OBS Studio |
| `winreg` | `0.56.0` | `MIT` | Registro opcional por usuário (`HKCU\...\Run`) |

### Nota sobre dependências transitivas `MPL-2.0`

A árvore de compilação do `tauri` para Windows inclui 5 crates transitivas licenciadas sob **MPL-2.0** (weak copyleft por arquivo, compatível com distribuição sob MIT ou Apache-2.0 quando não modificadas):

- `cssparser 0.37.0`
- `cssparser-macros 0.7.1`
- `dtoa-short 0.3.5`
- `option-ext 0.2.0`
- `selectors 0.38.0`

### Assets e integrações externas

- **Logotipos Toranja Tech:** arquivos vetoriais proprietários da Toranja Tech incorporados em `apps/desktop/src/assets/toranja-symbol-orange.svg` e `toranja-symbol-white.svg`.
- **Social Stream Ninja:** acessado apenas em tempo de execução como URL remota fornecida pelo próprio usuário (nenhum código-fonte do Social Stream Ninja é redistribuído no repositório).
- **Fontes de interface (`Clash Display` / `Inter`):** carregadas com fallback nativo do sistema (`Segoe UI` / `system-ui`); antes de publicação comercial offline ou alteração de distribuição, revisar eventuais avisos das licenças das fontes caso venham a ser empacotadas localmente.

---

## Checklist de licenciamento

- [x] Definir a licença final do código-fonte do Toranja Overlay (`MIT`) e adicionar o arquivo `LICENSE` na raiz.
- [ ] Incluir avisos de atribuição em terceiro plano (`THIRD-PARTY-NOTICES`) caso a distribuição futura incorpore fontes locais ou bibliotecas extras.
