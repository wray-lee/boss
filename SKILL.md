---
name: boss
description: "Boss / manager / employee delegation: the main session is the boss, a configurable manager subagent (default GLM) plans and dispatches tiered employee subagents (efficient / default / advanced), reviews and reworks, and the boss only does the final gate. Use when the user says /boss, \"boss mode\", or asks for manager/employee delegation."
---

# /boss — boss / manager / employee

You are the **boss**. You do not plan or dispatch the work. You hand the task to the manager and check what comes back.

| Role | Who | Configured in |
|---|---|---|
| boss | you (main session) | — |
| manager | subagent `boss-manager` | `boss.json` → `manager` |
| employees | subagents `boss-employee-<tier>` | `boss.json` → `tiers` (default: efficient / default / advanced) |

Config: `~/.claude/skills/boss/boss.json` holds model, effort, maxConcurrent and description for each role and tier, plus `maxRounds`.

## Changing models, effort or tiers

1. Edit `boss.json`. Tier names are free-form; you can add, remove or rename tiers.
2. **Auto-sync**: The boss automatically runs `sync_agents.py` in the background if `~/.claude/agents/boss-*.md` are missing or outdated. You can also manually run `python -I ~/.claude/skills/boss/sync_agents.py`.
3. New or renamed agent files load after `/reload-plugins` or a session restart. Tell the user if that is needed.

## Modes

| | workflow mode (default) | subagent mode |
|---|---|---|
| Who dispatches | `boss.workflow.js`; the manager only plans and reviews | the manager itself, via Agent calls |
| Flow | fixed: plan → execute (DAG, parallel) → review → rework, at most `maxRounds` | free-form; the manager can use any pattern (adversarial verify, staged work, …) |
| Caps | per-tier `maxConcurrent` enforced by the script | per-tier `maxConcurrent` followed by the manager's instructions |
| Pick when | you want predictable cost and strict caps | the task needs judgment about how to orchestrate |

The user picks the mode, e.g. `/boss subagent <task>`. Without one, use workflow mode.

## Steps

1. **Auto-sync & Brief.**
   - Ensure agents are present: if `~/.claude/agents/boss-manager.md` is missing, silently run `python -I ~/.claude/skills/boss/sync_agents.py` (or the equivalent path in your skills directory) in the background before dispatching.
   - Collect:
     - the user's task verbatim;
     - the context the manager cannot discover itself: decisions already made, constraints, authorizations (push/deploy allowed or not), relevant memory facts;
     - the acceptance criteria.

   Do not pre-plan the work for the manager.
   - **workflow mode:** read `boss.json`, then call `Workflow({scriptPath: "~/.claude/skills/boss/boss.workflow.js" (absolute path), args: {task, config: <boss.json object>, context}})`. When re-briefing, add `feedback`.
   - **subagent mode:** make a single Agent call with `subagent_type: "boss-manager"`, `effort` set to the manager effort from `boss.json`, and no `model` parameter. The prompt is the brief above.

2. **Wait.** Do not do the manager's or employees' work in the meantime. Do not SendMessage to a running manager or workflow agent. If the user adds requirements mid-run, keep them for step 4, or stop the run and re-brief.

3. **Final gate.** Verify the manager's report yourself, cheaply and directly:
   - spot-check the claimed evidence (git log/diff, test result lines, CI status, files);
   - re-run the decisive check if it is quick;
   - confirm that nothing outside the scope was touched, especially `~/.claude` and secrets;
   - confirm that the repo rules were followed (CLAUDE.md, commit/push rules).

4. **Decide.**
   - **Pass:** report to the user. Say what was delivered, what you verified yourself, and what is still open.
   - **Fail:** send feedback once. The feedback says what is wrong, gives the evidence, and states what is expected.
     - subagent mode: SendMessage the finished manager (load SendMessage with ToolSearch if needed). It keeps its full context, so it reworks without re-investigating. Only send this after its completion notification arrives; never message it while it is running. If that fails, start a fresh manager with the original brief plus the feedback.
     - workflow mode: re-run with `feedback` in args.

     If it fails again, report to the user with the gaps; do not loop indefinitely.
   - Actions that need user consent stay with you and the user, never with the manager. This includes deploys, outward-facing actions and destructive operations, unless the user already authorized them for this task.

## Notes

- **Settings override caveat**: If `CLAUDE_CODE_WORKFLOW_SUBAGENT_MODEL` is set in `settings.json` or env vars, the Workflow engine forces all workflow subagents to that model, overriding `boss.json` tiers. If workflow model routing fails, remind the user to unset that variable, or use subagent mode instead.
- Top-tier models (opus / fable / astra) should keep `maxConcurrent <= 3` (global CLAUDE.md rule).
- Subagents can use the Agent tool but not Workflow. That is why subagent mode dispatches with Agent calls, and why only the boss can start workflow mode.
- Subagent mode: an Agent call with `name` would turn the employee into a mailbox teammate whose result never returns. The manager's frontmatter hook `strip_agent_name.py` removes `name`/`team_name`. Unnamed employees run in the background, and the manager is resumed automatically when they finish. After changing a frontmatter hook, run `/reload-plugins`.
- In workflow mode the script tells the manager not to dispatch, because its agent file says to dispatch in subagent mode.
- Employees inherit CLAUDE.md, so the manager only passes task-specific rules.
