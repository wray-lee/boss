$ErrorActionPreference = "Stop"
$SkillDir = Join-Path $HOME ".claude\skills\boss"
$RepoRaw = "https://raw.githubusercontent.com/wray-lee/boss/master"

Write-Host "📦 Installing Boss skill for Claude Code..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $SkillDir | Out-Null

$Files = @("SKILL.md", "boss.workflow.js", "strip_agent_name.py", "sync_agents.py")
foreach ($File in $Files) {
    Invoke-WebRequest -Uri "$RepoRaw/$File" -OutFile (Join-Path $SkillDir $File)
}

$ConfigFile = Join-Path $SkillDir "boss.json"
if (-not (Test-Path $ConfigFile)) {
    Invoke-WebRequest -Uri "$RepoRaw/boss.json" -OutFile $ConfigFile
    Write-Host "✔ Created default boss.json" -ForegroundColor Green
} else {
    Write-Host "ℹ Kept existing boss.json configuration" -ForegroundColor Yellow
}

# Run sync_agents.py
try {
    python -I (Join-Path $SkillDir "sync_agents.py")
} catch {
    # silent fallback
}

Write-Host "✨ Boss skill installed cleanly in $SkillDir (zero bloat, no .git or doc clutter)!" -ForegroundColor Green
Write-Host "👉 Run '/reload-plugins' in Claude Code to start using /boss" -ForegroundColor Cyan
