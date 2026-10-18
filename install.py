"""Cross-platform clean installer for Boss skill.

Copies ONLY runtime files to ~/.claude/skills/boss (zero bloat, no .git or doc clutter).
"""

import shutil
import subprocess
import sys
from pathlib import Path

RUNTIME_FILES = [
    "SKILL.md",
    "boss.workflow.js",
    "strip_agent_name.py",
    "sync_agents.py",
]

def main() -> None:
    if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    src_dir = Path(__file__).resolve().parent
    dest_dir = Path.home() / ".claude" / "skills" / "boss"
    dest_dir.mkdir(parents=True, exist_ok=True)

    print(f"Installing Boss skill into {dest_dir}...")

    # Copy runtime files
    for file_name in RUNTIME_FILES:
        src = src_dir / file_name
        dest = dest_dir / file_name
        if src.exists():
            shutil.copy2(src, dest)
            print(f"  [OK] Installed {file_name}")

    # Preserve custom boss.json if already exists
    config_dest = dest_dir / "boss.json"
    config_src = src_dir / "boss.json"
    if not config_dest.exists() and config_src.exists():
        shutil.copy2(config_src, config_dest)
        print("  [OK] Installed default boss.json")
    else:
        print("  [INFO] Kept existing boss.json configuration")

    # Run agent synchronization
    sync_script = dest_dir / "sync_agents.py"
    if sync_script.exists():
        subprocess.run([sys.executable, "-I", str(sync_script)], check=False)

    print("\nBoss skill installed cleanly (no .git or docs cluttering ~/.claude)!")
    print("Run '/reload-plugins' in Claude Code to start using /boss")

if __name__ == "__main__":
    main()
