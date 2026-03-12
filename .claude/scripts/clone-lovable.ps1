param(
    [string]$RepoUrl
)

if (-not $RepoUrl) {
    Write-Host "Usage: .\scripts\clone-lovable.ps1 -RepoUrl https://github.com/USERNAME/REPO.git"
    exit
}

$targetBase = "C:\Users\USER\Documents\lovable-repos"

if (!(Test-Path $targetBase)) {
    New-Item -ItemType Directory -Force -Path $targetBase | Out-Null
}

Set-Location $targetBase
git clone $RepoUrl

Write-Host "Repository cloned into $targetBase"