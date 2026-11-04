$ErrorActionPreference = 'Stop'
Set-Location 'F:\mv\paper-collage-mv'
$mvBin = (Get-ChildItem 'F:\mv\tools\ffmpeg' -Filter ffmpeg.exe -Recurse | Select-Object -First 1).DirectoryName
$env:PATH = $mvBin + ';' + $env:PATH
$env:REMOTION_BROWSER_EXECUTABLE = 'F:\mv\tools\remotion-browser\chrome-headless-shell-win64\chrome-headless-shell.exe'
$env:PAPER_COLLAGE_RENDER_CONCURRENCY = '6'
node scripts/project-render.mjs preview time-patina-paper
exit $LASTEXITCODE
