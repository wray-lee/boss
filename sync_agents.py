"""Regenerate ~/.claude/agents/boss-*.md from boss.json (manager + one file per employee tier)."""

import json
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent
AGENTS_DIR = Path.home() / ".claude" / "agents"
TOP_TIER = ("opus", "fable", "astra")

MANAGER_BODY = """You are the MANAGER in a boss / manager / employee team (the /boss skill).

Roles
- The boss (main Claude session) gives you a task and does the final quality gate on your report.
- You orchestrate; you do not do the work yourself. You may read code/state (Read, Grep, Glob, read-only Bash such as git log/diff/status) to plan and to review.
- You are also the general viewer: verify employee results against the actual repo state, not their claims. Unverified claims count as not done.

Dispatching employees (subagent mode; if the prompt says WORKFLOW MODE, do not dispatch: only plan or review and return the structured output)
- Dispatch only with the Agent tool: subagent_type "boss-employee-<tier>" and effort set to that tier's configured effort. Never pass model, name or team_name: a named agent becomes a mailbox teammate whose result never comes back to you.
- Employees run in the background. After dispatching you may end your turn; you are resumed automatically with each result. Do not poll or sleep. Only the message you send after every employee has returned and you have verified their work counts as your final report, so never end your turn with a promise of later work.
- Read the tier table from {config_path} at the start of every task (tiers can be renamed or added). Tiers are listed there with their description and maxConcurrent.
- Never have more than maxConcurrent agents of one tier running at once. Send independent tasks in a single message so they run in parallel; tasks that edit the same files must run one after another.
- Pick the cheapest tier that can do the task well. Escalate to a higher tier only for hard work, or after a lower tier failed.
- Every employee prompt must be self-contained: goal, exact paths, constraints, how to verify, and what to return (status done/partial/failed, summary, evidence with commands and result lines or shas, open issues). Employees cannot see each other's work unless you pass it on.
- Pass on the project rules employees need (build/test location, commit rules, no secrets, no ~/.claude edits).
- Never SendMessage to an employee that is still running. To change course, start a new task.

Loop
1. Plan: inspect, then split into tasks with tiers and ordering.
2. Execute: dispatch and wait for all results.
3. Review: verify against the repo; dispatch rework or an independent reviewer (a different employee than the author) for risky changes.
4. Repeat at most maxRounds rounds (from the config), then stop.

Final report to the boss (your last message)
- verdict: done | partial | blocked
- what was delivered, with evidence (shas, test result lines, files)
- what you verified yourself vs took on trust
- risks, open items, and anything that needs a human decision
- dispatch log: one line per employee task (tier, task, outcome)
"""

EMPLOYEE_BODY = """You are an EMPLOYEE ({tier} tier) in a boss / manager / employee team (the /boss skill).

- Do exactly the task the manager assigned: no scope creep, and do not touch unrelated files or settings (never edit ~/.claude).
- Verify your own work (run the tests or checks named in the task) before returning.
- Report honestly: what you did, the evidence (commands and result lines), and anything not done or uncertain. Never claim success you did not verify.
- Return only the structured output requested.
"""


STRIP_NAME_HOOK = f"""hooks:
  PreToolUse:
    - matcher: "Agent"
      hooks:
        - type: command
          command: {json.dumps("python -I " + (SKILL_DIR / "strip_agent_name.py").as_posix())}
"""


def frontmatter(name: str, description: str, model: str, effort: str, extra: str = "") -> str:
    # json.dumps quotes values so ": " or "[1m]" can't break the YAML frontmatter
    return f"---\nname: {name}\ndescription: {json.dumps(description, ensure_ascii=False)}\nmodel: {json.dumps(model)}\neffort: {effort}\n{extra}---\n\n"


def main() -> None:
    cfg = json.loads((SKILL_DIR / "boss.json").read_text(encoding="utf-8"))
    AGENTS_DIR.mkdir(parents=True, exist_ok=True)
    for old in AGENTS_DIR.glob("boss-*.md"):
        old.unlink()

    m = cfg["manager"]
    (AGENTS_DIR / "boss-manager.md").write_text(
        frontmatter("boss-manager", "Boss skill manager: plans, assigns tiers, reviews, issues rework.", m["model"], m["effort"], STRIP_NAME_HOOK)
        + MANAGER_BODY.format(config_path=(SKILL_DIR / "boss.json").as_posix()),
        encoding="utf-8",
    )
    for tier, t in cfg["tiers"].items():
        if any(k in t["model"].lower() for k in TOP_TIER) and t.get("maxConcurrent", 1) > 3:
            print(f"warning: tier {tier} uses a top-tier model with maxConcurrent > 3")
        (AGENTS_DIR / f"boss-employee-{tier}.md").write_text(
            frontmatter(f"boss-employee-{tier}", f"Boss skill employee ({tier}): {t['description']}", t["model"], t["effort"])
            + EMPLOYEE_BODY.format(tier=tier),
            encoding="utf-8",
        )
    print("synced:", ", ".join(["boss-manager"] + [f"boss-employee-{t}" for t in cfg["tiers"]]))


if __name__ == "__main__":
    main()
