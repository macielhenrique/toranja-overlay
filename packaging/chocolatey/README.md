# Pacote Chocolatey — Toranja Overlay

Este diretório contém a definição oficial do pacote **`toranja-overlay`** para o [Chocolatey Community Repository](https://community.chocolatey.org/).

## Arquivos

- [`toranja-overlay.nuspec`](toranja-overlay.nuspec): metadados do pacote (versão, licença MIT, ícone, URLs oficiais e descrição).
- [`tools/chocolateyinstall.ps1`](tools/chocolateyinstall.ps1): baixa o instalador NSIS oficial publicado no GitHub Releases, valida o hash `SHA-256` e executa a instalação silenciosa (`/S`).
- [`tools/chocolateyuninstall.ps1`](tools/chocolateyuninstall.ps1): localiza o registro oficial no Windows e executa a desinstalação silenciosa (`/S`).

## Como empacotar e enviar uma release

1. **Gerar o arquivo `.nupkg`** (a partir da raiz do repositório):

   ```powershell
   choco pack .\packaging\chocolatey\toranja-overlay.nuspec --outputdirectory .\release\v0.1.0
   ```

2. **Testar instalação e desinstalação localmente (PowerShell como Administrador):**

   ```powershell
   choco install toranja-overlay --source ".\release\v0.1.0" -y
   choco uninstall toranja-overlay -y
   ```

3. **Configurar sua API Key do Chocolatey (apenas uma vez):**

   ```powershell
   choco apikey --key SUA-CHAVE-AQUI --source https://push.chocolatey.org/
   ```

4. **Enviar o pacote para moderação:**

   ```powershell
   choco push .\release\v0.1.0\toranja-overlay.0.1.0.nupkg --source https://push.chocolatey.org/
   ```

> **Atualizando para novas versões:** atualize `<version>` e `<releaseNotes>` no `.nuspec` e atualize `url64bit` e `checksum64` em `tools/chocolateyinstall.ps1` com os dados da nova Release no GitHub.
