#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);

// Options parsing
let customPath = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--path' || args[i] === '-p') {
    customPath = args[++i];
  }
}

const skillTargetDir = customPath
  ? path.resolve(customPath)
  : path.join(os.homedir(), '.claude', 'skills', 'boss');

const agentsGlobalDir = path.join(os.homedir(), '.claude', 'agents');
const srcDir = __dirname;

console.log(`\x1b[36m📦 Installing Boss Skill for Claude Code...\x1b[0m`);
console.log(`\x1b[90mTarget skill directory: ${skillTargetDir}\x1b[0m\n`);

fs.mkdirSync(skillTargetDir, { recursive: true });
fs.mkdirSync(agentsGlobalDir, { recursive: true });

// 1. Copy core runtime files
const runtimeFiles = [
  'SKILL.md',
  'boss.workflow.js',
  'strip_agent_name.py',
  'sync_agents.py',
];

for (const file of runtimeFiles) {
  const src = path.join(srcDir, file);
  const dest = path.join(skillTargetDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`\x1b[32m✔ Installed ${file}\x1b[0m`);
  }
}

// 2. Preserve custom boss.json if it exists
const destConfig = path.join(skillTargetDir, 'boss.json');
const srcConfig = path.join(srcDir, 'boss.json');
if (!fs.existsSync(destConfig) && fs.existsSync(srcConfig)) {
  fs.copyFileSync(srcConfig, destConfig);
  console.log(`\x1b[32m✔ Created default boss.json\x1b[0m`);
} else {
  console.log(`\x1b[33mℹ Kept existing boss.json configuration\x1b[0m`);
}

// 3. Deploy pre-built agents directly (100% fail-proof, no Python dependency required)
const srcAgentsDir = path.join(srcDir, 'agents');
if (fs.existsSync(srcAgentsDir)) {
  const agentFiles = fs.readdirSync(srcAgentsDir).filter(f => f.endsWith('.md'));
  for (const agentFile of agentFiles) {
    fs.copyFileSync(
      path.join(srcAgentsDir, agentFile),
      path.join(agentsGlobalDir, agentFile)
    );
  }
  console.log(`\x1b[32m✔ Registered ${agentFiles.length} subagents in ${agentsGlobalDir}\x1b[0m`);
}

// Optional: run python sync if python is in PATH
try {
  const syncPy = path.join(skillTargetDir, 'sync_agents.py');
  if (fs.existsSync(syncPy)) {
    spawnSync('python', ['-I', syncPy], { stdio: 'ignore' });
  }
} catch {
  // silent fallback
}

console.log(`\n\x1b[32m✨ Boss skill installed cleanly! (Zero bloat, no .git or doc clutter)\x1b[0m`);
console.log(`\x1b[36m👉 Run '/reload-plugins' in Claude Code to start using /boss\x1b[0m\n`);
