# Push your Wedding Invitation repository to GitHub
param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl
)

$git = "C:\Users\Sakib\AppData\Local\Programs\MinGit\cmd\git.exe"

Write-Host "Setting remote origin to: $RepoUrl"
& $git remote remove origin 2>$null
& $git remote add origin $RepoUrl

Write-Host "Pushing branch 'main' to GitHub..."
& $git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSUCCESS! Your wedding invitation is now on GitHub!" -ForegroundColor Green
} else {
    Write-Host "`nPush encountered an issue. If GitHub asked for authentication, sign in with your GitHub Personal Access Token or browser credentials." -ForegroundColor Yellow
}
