# Prepares this folder as a Git repository, ready to push to GitHub.
# Requires Git: https://git-scm.com/download/win
# Usage: .\setup-git.ps1

$ErrorActionPreference = "Stop"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed or not on PATH." -ForegroundColor Red
    Write-Host "Install it from https://git-scm.com/download/win and reopen PowerShell." -ForegroundColor Yellow
    exit 1
}

Set-Location -Path $PSScriptRoot

if (Test-Path ".git") {
    Write-Host "Git repository already initialized." -ForegroundColor Cyan
} else {
    git init
    git branch -M main
    Write-Host "Initialized a new Git repository on branch 'main'." -ForegroundColor Green
}

# Author details are pre-configured for Ayomide Isiaka. Nothing to edit.
git config user.name "AYOMIDE ISIAKA"
git config user.email "isiakaayomide24@gmail.com"

$changes = git status --porcelain
if ($changes) {
    git add .
    git commit -m "Initial commit: Nova AI chat assistant"
    Write-Host "Created the initial commit." -ForegroundColor Green
} else {
    Write-Host "No changes to commit." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Create an empty repo at https://github.com/new"
Write-Host "  2. Run: gh repo create nova-ai-chat-assistant --public --source=. --remote=origin --push"
Write-Host "     OR: git remote add origin https://github.com/YOUR_USERNAME/nova-ai-chat-assistant.git"
Write-Host "         git push -u origin main"
