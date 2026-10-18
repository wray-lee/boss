export const meta = {
  name: 'boss',
  description: 'Boss workflow mode: manager plans and assigns tiers, employees execute under per-tier caps, manager reviews and reworks, returns a report for the boss gate',
  whenToUse: 'Run via the /boss skill (workflow mode) with args {task, config, context?, feedback?}',
  phases: [{ title: 'Plan' }, { title: 'Execute' }, { title: 'Review' }],
}

// args: { task: string, config: <contents of boss.json>, context?: string, feedback?: string }
const cfg = args.config
const TIERS = Object.keys(cfg.tiers)
const maxRounds = cfg.maxRounds || 3
const tierList = TIERS.map(t => `- ${t}: ${cfg.tiers[t].description}`).join('\n')
const MODE = 'WORKFLOW MODE: the workflow dispatches employees for you. Do NOT call the Agent tool and do NOT dispatch anyone yourself; read-only inspection only. Return only the structured output.'

const TASK_ITEM = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    tier: { type: 'string', enum: TIERS },
    title: { type: 'string' },
    prompt: { type: 'string', description: 'Self-contained instructions: goal, exact paths, constraints, verification, what to return' },
    depends_on: { type: 'array', items: { type: 'string' } },
    acceptance: { type: 'string' },
  },
  required: ['id', 'tier', 'title', 'prompt', 'depends_on', 'acceptance'],
}
const PLAN = {
  type: 'object',
  properties: { summary: { type: 'string' }, tasks: { type: 'array', items: TASK_ITEM, minItems: 1 } },
  required: ['summary', 'tasks'],
}
const EMP = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['done', 'partial', 'failed'] },
    summary: { type: 'string' },
    evidence: { type: 'string', description: 'Commands run and their result lines, commit shas, file:line' },
    open_issues: { type: 'string' },
  },
  required: ['status', 'summary', 'evidence', 'open_issues'],
}
const REVIEW = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['done', 'rework', 'blocked'] },
    findings: { type: 'string', description: 'What was verified in the repo/state and what is wrong or missing' },
    rework_tasks: { type: 'array', items: TASK_ITEM },
    final_report: { type: 'string', description: 'For the boss: delivered work, evidence, what you verified vs took on trust, risks, open items, human decisions needed' },
  },
  required: ['verdict', 'findings', 'rework_tasks', 'final_report'],
}

// per-tier concurrency caps
const slots = {}
for (const t of TIERS) slots[t] = { free: cfg.tiers[t].maxConcurrent || 4, waiters: [] }
const acquire = t => slots[t].free > 0 ? (slots[t].free--, Promise.resolve()) : new Promise(r => slots[t].waiters.push(r))
const release = t => { const w = slots[t].waiters.shift(); if (w) w(); else slots[t].free++ }

const managerOpts = (label, phase, schema) => ({ agentType: 'boss-manager', effort: cfg.manager.effort, label, phase, schema })

async function runTasks(tasks, round) {
  const results = {}
  const byId = Object.fromEntries(tasks.map(t => [t.id, t]))
  const started = {}
  const run = id => {
    if (started[id]) return started[id]
    const t = byId[id]
    started[id] = (async () => {
      const deps = (t.depends_on || []).filter(d => byId[d] && d !== id)
      await Promise.all(deps.map(run))
      const depText = deps.length ? '\n\nResults of tasks you depend on:\n' + deps.map(d => `[${d}] ${JSON.stringify(results[d])}`).join('\n') : ''
      const tier = TIERS.includes(t.tier) ? t.tier : TIERS[Math.min(1, TIERS.length - 1)]
      await acquire(tier)
      try {
        results[id] = await agent(`${t.prompt}\n\nAcceptance criteria: ${t.acceptance}${depText}`,
          { agentType: `boss-employee-${tier}`, effort: cfg.tiers[tier].effort, label: `r${round}:${tier}:${t.id}`, phase: 'Execute', schema: EMP })
          || { status: 'failed', summary: 'agent returned nothing', evidence: '', open_issues: 'agent died or was skipped' }
      } finally { release(tier) }
    })()
    return started[id]
  }
  await Promise.all(tasks.map(t => run(t.id)))
  return tasks.map(t => ({ id: t.id, tier: t.tier, title: t.title, result: results[t.id] }))
}

const base = `${MODE}\n\nTASK FROM THE BOSS:\n${args.task}${args.context ? `\n\nCONTEXT:\n${args.context}` : ''}${args.feedback ? `\n\nBOSS FEEDBACK ON THE PREVIOUS ATTEMPT (must be addressed):\n${args.feedback}` : ''}\n\nEMPLOYEE TIERS:\n${tierList}`

phase('Plan')
const plan = await agent(`${base}\n\nInspect the relevant code/state yourself first (read-only), then break the task into employee tasks. Use depends_on for ordering; independent tasks run in parallel. Tasks that edit the same files must be sequenced or merged into one task. Pick the cheapest suitable tier per task.`, managerOpts('manager:plan', 'Plan', PLAN))
if (!plan) return { error: 'manager failed to plan' }
log(`plan: ${plan.tasks.length} tasks (${TIERS.map(t => `${t} ${plan.tasks.filter(x => x.tier === t).length}`).join(', ')})`)

const history = []
let tasks = plan.tasks, review = null
for (let round = 1; round <= maxRounds; round++) {
  phase('Execute')
  const done = await runTasks(tasks, round)
  history.push({ round, tasks: done })
  phase('Review')
  const earlier = round > 1 ? `EARLIER ROUNDS:\n${JSON.stringify(history.slice(0, -1).map(h => ({ round: h.round, tasks: h.tasks.map(t => ({ id: t.id, status: t.result.status, summary: t.result.summary })) })))}\n\n` : ''
  review = await agent(`${base}\n\nPLAN: ${plan.summary}\n\nROUND ${round} RESULTS:\n${JSON.stringify(done)}\n\n${earlier}As general viewer, verify the results against the actual repo/state (read-only: git log/diff, files, test output; re-run cheap checks). verdict=done only if the whole boss task is complete and verified; rework (with rework_tasks) if more employee work is needed${round === maxRounds ? ' — this is the LAST round, so choose done or blocked and list remaining gaps in final_report' : ''}; blocked if a human decision or unavailable resource is required.`, managerOpts(`manager:review-r${round}`, 'Review', REVIEW))
  if (!review) return { error: `manager failed to review round ${round}`, plan, history }
  log(`round ${round}: ${review.verdict}`)
  if (review.verdict !== 'rework' || !review.rework_tasks.length) break
  tasks = review.rework_tasks
}
return { verdict: review.verdict, final_report: review.final_report, findings: review.findings, plan: { summary: plan.summary, tasks: plan.tasks.map(t => ({ id: t.id, tier: t.tier, title: t.title })) }, history }
