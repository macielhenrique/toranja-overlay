$ErrorActionPreference = 'Stop'

$packageName  = $env:ChocolateyPackageName
$softwareName = 'Toranja Overlay*'

[array]$key = Get-UninstallRegistryKey -SoftwareName $softwareName

if ($key.Count -eq 1) {
  $key | ForEach-Object {
    $raw = [string]$_.UninstallString
    $raw = $raw.Trim()
    if ($raw -match '^"([^"]+)"') {
      $uninstallFile = $matches[1]
    } else {
      $uninstallFile = $raw
    }

    $packageArgs = @{
      packageName    = $packageName
      fileType       = 'EXE'
      silentArgs     = '/S'
      validExitCodes = @(0)
      file           = $uninstallFile
    }

    Uninstall-ChocolateyPackage @packageArgs
  }
} elseif ($key.Count -eq 0) {
  Write-Warning "$packageName has already been uninstalled by other means."
} elseif ($key.Count -gt 1) {
  Write-Warning "$($key.Count) matches found!"
  Write-Warning 'To prevent accidental data loss, no programs will be uninstalled.'
  Write-Warning 'Please alert package maintainer the following keys were matched:'
  $key | ForEach-Object { Write-Warning "- $($_.DisplayName)" }
}
