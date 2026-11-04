$ErrorActionPreference='Stop'
Set-Location -LiteralPath $PSScriptRoot
$env:REMOTION_BROWSER_EXECUTABLE='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$ffmpegBin=(Get-ChildItem 'F:\mv\tools\ffmpeg' -Filter ffmpeg.exe -Recurse | Select-Object -First 1).DirectoryName
$env:PATH=$ffmpegBin+';'+$env:PATH
npm.cmd run project:preview -- time-patina-paper
