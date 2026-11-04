$ErrorActionPreference = 'Stop'
Set-Location 'F:\mv\paper-collage-mv'
$mvBin = (Get-ChildItem 'F:\mv\tools\ffmpeg' -Filter ffmpeg.exe -Recurse | Select-Object -First 1).DirectoryName
$env:PATH = $mvBin + ';' + $env:PATH
$env:REMOTION_BROWSER_EXECUTABLE = 'F:\mv\tools\remotion-browser\chrome-headless-shell-win64\chrome-headless-shell.exe'
$env:PAPER_COLLAGE_RENDER_CONCURRENCY = '6'
node scripts/project-render.mjs render time-patina-paper
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$mvFinal = 'F:\mv\paper-collage-mv\dist\time-patina-paper\final.mp4'
$mvDelivery = 'F:\mv\paper-collage-mv\dist\time-patina-paper\交给时间斑驳_场景扩充版_v7_1080p.mp4'
Copy-Item -LiteralPath $mvFinal -Destination $mvDelivery
Write-Output "Exported: $mvDelivery"
