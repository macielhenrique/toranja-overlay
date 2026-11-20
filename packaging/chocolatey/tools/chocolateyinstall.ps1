$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName    = $env:ChocolateyPackageName
  fileType       = 'EXE'
  url64bit       = 'https://github.com/macielhenrique/toranja-overlay/releases/download/v0.1.0/Toranja-Overlay-0.1.0-x64-setup.exe'
  checksum64     = 'fbd234bc6da4c20f05e2ffcdb1cc723b5fb5ba36b96b557cad9d44c691dcad22'
  checksumType64 = 'sha256'
  silentArgs     = '/S'
  validExitCodes = @(0)
  softwareName   = 'Toranja Overlay*'
}

Install-ChocolateyPackage @packageArgs
