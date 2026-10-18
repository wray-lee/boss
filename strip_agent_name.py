"""PreToolUse hook for boss-manager: drop name/team_name from Agent calls.

A named Agent call becomes a mailbox teammate whose result never returns to the manager;
an unnamed one runs in the background and the manager is resumed when it finishes.
"""

import json
import sys

event = json.load(sys.stdin)
tool_input = event.get("tool_input") or {}
if event.get("tool_name") == "Agent" and ("name" in tool_input or "team_name" in tool_input):
    cleaned = {k: v for k, v in tool_input.items() if k not in ("name", "team_name")}
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "allow", "updatedInput": cleaned}}))
