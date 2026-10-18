#!/usr/bin/env bash
set -e

SKILL_DIR="${HOME}/.claude/skills/boss"
REPO_RAW="https://raw.githubusercontent.com/wray-lee/boss/master"

echo "📦 Installing Boss skill for Claude Code..."
mkdir -p "$SKILL_DIR"

# Download essential runtime files (zero bloat: no .git, no docs, no assets)
for file in SKILL.md boss.workflow.js strip_agent_name.py sync_agents.py; do
  curl -fsSL "$REPO_RAW/$file" -o "$SKILL_DIR/$file"
done

# Keep existing boss.json if user already customized it
if [ ! -f "$SKILL_DIR/boss.json" ]; then
  curl -fsSL "$REPO_RAW/boss.json" -o "$SKILL_DIR/boss.json"
  echo "✔ Created default boss.json"
else
  echo "ℹ Kept existing boss.json configuration"
fi

# Sync agents to ~/.claude/agents/
python3 -I "$SKILL_DIR/sync_agents.py" 2>/dev/null || python -I "$SKILL_DIR/sync_agents.py" 2>/dev/null || true

echo "✨ Boss skill installed cleanly in $SKILL_DIR"
echo "👉 Run '/reload-plugins' in Claude Code to start using /boss"
