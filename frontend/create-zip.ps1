$sourceDir = $PSScriptRoot
$zipPath = Join-Path (Split-Path $sourceDir) "SDL-Frontend.zip"
$tempDir = Join-Path $env:TEMP "sdl-frontend-pack-$(Get-Random)"

New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

Get-ChildItem -Path $sourceDir -Exclude "node_modules",".git","dist","SDL-Frontend.zip","create-zip.ps1" | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $tempDir -Recurse -Force
}

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path (Join-Path $tempDir "*") -DestinationPath $zipPath -Force
Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Zip created: $zipPath"
