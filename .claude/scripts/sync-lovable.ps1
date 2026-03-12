param(
    [string]$RepoName,
    [string]$TargetName
)

if (-not $RepoName -or -not $TargetName) {
    Write-Host "Usage: .\scripts\sync-lovable.ps1 -RepoName REPO_NAME -TargetName TOOL_NAME"
    exit
}

$source = "C:\Users\USER\Documents\lovable-repos\$RepoName"
$target = "C:\Users\USER\Downloads\ort-presentation-builder\training\presentation\$TargetName\source-lovable"

if (!(Test-Path $source)) {
    Write-Host "Source repo not found: $source"
    exit
}

if (!(Test-Path $target)) {
    New-Item -ItemType Directory -Force -Path $target | Out-Null
}

Get-ChildItem -Path $target -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item "$source\*" $target -Recurse -Force

Write-Host "Synced from $source to $target"