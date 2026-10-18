<div align="center">

# 🏢 Boss

### **Hierarchical Multi-Agent Delegation for Claude Code**

**Near 2-Level (2L) Quality at a Fraction of the Token Cost**  
*三级分级架构：用极致的 Token 成本，达到逼近昂贵两级顶配的交付质量*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Skill-blueviolet?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTEyIDJMMyA3djEwbDkgNSA5LTVWN2wtOS01eiIvPjwvc3ZnPg==)](https://docs.anthropic.com/en/docs/claude-code)
[![Cost-Efficiency](https://img.shields.io/badge/Token_Savings-Up_to_70%25-success)]()
[![Platform](https://img.shields.io/badge/Platform-Win%20%7C%20Mac%20%7C%20Linux-brightgreen)]()

<br/>

```
                    ┌─────────┐
                    │  👔 Boss │ ← You (main session) — final quality gate
                    └────┬────┘
                         │ brief
                    ┌────▼────┐
                    │📋Manager│ ← Medium model (GLM/Sonnet): plans & reviews
                    └────┬────┘
        ┌────────────────┼────────────────┐
        │ 80% Workload   │ 15% Workload   │ 5% Hard Stuff
   ┌────▼───┐       ┌────▼───┐       ┌────▼────┐
   │⚡ Fast  │       │🔧 Mid  │       │🧠 Hard  │ ← Tiered employee models
   │(cheap) │       │(bal.)  │       │(top)    │
   └────────┘       └────────┘       └─────────┘
```

</div>

---

### 💡 Why Boss? (2-Level vs 3-Level)

> **"Our 3-tier architecture might not beat an all-flagship 2-level setup in raw peak firepower, but it slashes your token bill by 60–80% while reaching remarkably close delivery quality."**

| 维度 | 传统两级架构 (2L: Boss → Fleet) | 🏢 Boss 三级架构 (Boss → Manager → Tiers) |
|:---|:---|:---|
| **模型分配** | 全员顶配大模型 (Opus / Fable) 跑所有任务 | **按需分级**：Manager 中等模型规划，80% 杂活用极廉价模型，仅关键难点上顶级模型 |
| **Token 消耗** | 💸 **极高**（简单查文件、改样式都花昂贵 Token） | 💰 **极低**（大幅节省 60%~80% 费用） |
| **限流风险 (Rate Limit)** | ⚠️ 极易触发 429 熔断（多高配并行耗尽配额） | 🛡️ **安全平稳**（廉价模型高并发，高配模型严格限额 `maxConcurrent ≤ 3`） |
| **最终交付质量** | 🌟 100% 顶配上限 | 🎯 **~90%+ 逼近质量**（借助 Manager 严审 + DAG 依赖 + 自动返工闭环弥补） |

---

<details>
<summary><b>🇨🇳 中文说明 (Chinese)</b></summary>

## 核心设计理念：极致性价比

在多 Agent 协同场景中，**两级架构（Boss 直管全员）**往往要求所有 Agent 都是顶配大模型（如 Opus / Fable / Claude-3.5-Sonnet xhigh），否则容易翻车。但这带来了巨大的问题：
1. **Token 燃烧极其恐怖**：80% 的工作其实只是 `grep` 查代码、机械修改、读日志或写简单单测，杀鸡用牛刀。
2. **极易遭遇 Rate Limit 熔断**：高阶模型大并发会在十几分钟内耗光 Pro 配额。

**Boss 的破局之道（三级架构）**：
- **Boss**：主会话把控目标与最终验收，不插手具体排期。
- **Manager**：由高性价比的推理模型（如 GLM）担任，负责拆解任务、分配层级，并充当 General Viewer 严审代码。
- **Employees（分级员工）**：
  - `efficient`（廉价快速）：承担 80% 的搜索、读写、机械修改与格式化；
  - `default`（常规工程）：中度逻辑实现与常规测试；
  - `advanced`（攻坚攻关）：仅在并发锁、安全漏洞、底层架构等硬核问题上出动。

> 💡 **坦率的权衡**：我们坦白承认，三级架构在绝对极限思维深度上或许略逊于“全员顶配大模型的两级团队”；但通过 **DAG 依赖管理 + Manager 严格二次校验 + 自动返工机制（Auto-Rework）**，Boss 以极低的 Token 成本达到了**逼近顶配两级团队的交付质量**！

### ✨ 核心特性

- 🎯 **分级调度** — 3 个可配置层级（fast / default / advanced），按任务难度自动分配最经济的模型
- 🔀 **两种模式** — Workflow 模式（确定性 DAG 调度）和 Subagent 模式（经理自主编排）
- 🔄 **自动返工** — 审核不通过自动发起 rework，最多 `maxRounds` 轮，直到验收合格
- 🧩 **DAG 依赖** — 任务间声明 `depends_on`，独立任务自动并行，提升交付吞吐
- 🔒 **并发与配额保护** — 每层级独立的 `maxConcurrent` 限制，防止高阶模型击穿配额
- ⚙️ **一键配置** — 编辑 `boss.json` → 运行 `sync_agents.py` → 完成

### 🚀 安装

```bash
# 克隆到 Claude Code skills 目录
git clone https://github.com/wray-lee/boss.git ~/.claude/skills/boss

# 生成 agent 定义文件
python -I ~/.claude/skills/boss/sync_agents.py

# 重载插件（在 Claude Code 中）
/reload-plugins
```

### 📖 使用

```
/boss 重构 src/utils 模块，添加单元测试          # workflow 模式（默认，确定性 DAG + 控费）
/boss subagent 调查并修复 issue #42 的根因       # subagent 模式（经理自主编排）
```

### ⚙️ 配置示例 (`boss.json`)

```jsonc
{
  "manager": {
    "model": "glm[1m]",        // 经理模型：推荐高性价比推理模型
    "effort": "high"
  },
  "tiers": {
    "efficient": {              // 承担 80% 杂活，超高性价比
      "model": "sub[1m]",
      "effort": "high",
      "maxConcurrent": 8
    },
    "default": { ... },
    "advanced": {               // 攻坚克难，严格限额
      "model": "step5[1m]",
      "effort": "max",
      "maxConcurrent": 3
    }
  },
  "maxRounds": 5
}
```

</details>

---

<details>
<summary><b>🇯🇵 日本語説明 (Japanese)</b></summary>

## コア設計思想：圧倒的なコストパフォーマンス

従来の**2層マルチエージェント構成（Boss → 全員フラグシップモデル）**は強力ですが、致命的な課題があります：
1. **トークンの爆食**：タスクの80%は単なるファイル検索や定型的な編集、ログ解析であり、超高額モデルを使うのは無駄です。
2. **レート制限（429）の頻発**：高額モデルを大量並列実行すると、わずか十数分でクォータを使い果たします。

**Boss のソリューション（3層階層アプローチ）**：
- **Boss**：メインセッション。要件指示と最終的な品質ゲートに専念。
- **Manager**：中コスト・高推論モデル（GLM等）が担当。タスクをDAGに分解し、最適なティアへ割り当て、結果を厳格に検証。
- **Employees（ティア別従業員）**：
  - `efficient`（高速・格安）：80%の機械的修正・検索・フォーマットを担当。
  - `default`（標準）：通常の実装および単体テスト。
  - `advanced`（難問専用）：並行処理やセキュリティ、アーキテクチャ設計などの難所のみに投入。

> 💡 **率直なトレードオフ**：全員最高峰モデルを揃えた2層構成と比較すると、極限のピークパワーではわずかに劣る可能性があります。しかし、**Managerの厳格な検証＋DAG依存管理＋自動手戻し（Auto-rework）**により、**圧倒的に低いトークン消費で2層構成に迫る高品質な成果物**を実現します。

### ✨ 主な特徴

- 🎯 **ティア別ディスパッチ** — 難易度に応じて最も低コストなモデルを最適配分
- 🔀 **2つのモード** — 確定的DAGスケジューリング（Workflow）と自律的オーケストレーション（Subagent）
- 🔄 **自動リワーク** — レビュー不合格時に自動で修正タスクを発行、最大 `maxRounds` 回ループ
- 🧩 **DAG依存関係** — `depends_on` 宣言により、独立タスクは安全に最大並列実行
- 🔒 **レート制限保護** — ティア別の `maxConcurrent` 設定でクォータ枯渇を確実に防止
- ⚙️ **かんたん同期** — `boss.json` を編集して `sync_agents.py` を実行するだけ

### 🚀 インストール

```bash
# Claude Code skills ディレクトリにクローン
git clone https://github.com/wray-lee/boss.git ~/.claude/skills/boss

# エージェント定義ファイルを生成
python -I ~/.claude/skills/boss/sync_agents.py

# プラグインをリロード（Claude Code内で）
/reload-plugins
```

### 📖 使い方

```
/boss src/utilsモジュールをリファクタリングし、テストを追加    # workflowモード（デフォルト）
/boss subagent issue #42 の根本原因を調査して修正            # subagentモード
```

</details>

---

## 🌟 The Core Pitch: Cost vs. Quality

In typical multi-agent systems, **2-Level architectures (Boss directly dispatching a fleet)** run into two major bottlenecks:
1. **Astronomical Token Bills**: Running top-tier flagship models for routine file lookups, log reading, and mechanical diffs is wasteful overkill.
2. **Quota & Rate Limit Blowouts**: Spawning several top-tier models simultaneously burns through interactive rate limits in minutes.

### The 3-Tier Breakthrough

Boss introduces a pragmatic middle tier:

```
[ Boss (User Session) ]
       │ Hands off high-level goal
       ▼
[ Manager (Balanced Reasoning Model, e.g., GLM) ]
       │ • Dissects into dependency DAG
       │ • Assigns cheapest viable tier per task
       │ • Adversarially reviews outcome against actual repo state
       ▼
[ Tiered Employees ]
  ├── ⚡ Efficient (Cheap/Fast)  ── 80% of tasks (search, edits, linting, boilerplate)
  ├── 🔧 Default   (Balanced)    ── 15% of tasks (standard features, unit tests)
  └── 🧠 Advanced  (Top-Tier)    ──  5% of tasks (hard concurrency, security, deep bugs)
```

> **The Honest Trade-off**: An all-flagship 2-level team might boast marginally higher peak reasoning in extreme edge cases. However, through **rigorous manager verification, DAG dependency chaining, and automatic rework loops**, Boss achieves **~90%+ of that top-tier quality while slashing token consumption by up to 70%**.

---

## ✨ Features

- 🎯 **Cost-Aware Tiered Dispatch** — 3 configurable tiers (`efficient`, `default`, `advanced`), routing 80% of mundane tasks to lightweight models.
- 🔀 **Two Modes of Operation**:
  - **Workflow Mode (Default)**: Deterministic DAG execution via `boss.workflow.js`. Strict concurrency slots, structured plan-execute-review loop.
  - **Subagent Mode**: Autonomous orchestration where the manager freely issues `Agent` calls with flexible patterns.
- 🔄 **Automated Review & Rework** — The manager independently inspects repo diffs and test results. Incomplete tasks are sent back for rework automatically up to `maxRounds`.
- 🧩 **DAG Task Scheduling** — Tasks specify `depends_on`. Independent branches run concurrently; dependent tasks await prerequisites.
- 🔒 **Concurrency & Quota Guard** — Per-tier `maxConcurrent` limits prevent accidental rate-limit spikes on expensive models.
- ⚙️ **Dead-Simple Configuration** — Customize any model, tier, or effort in `boss.json`, then run `sync_agents.py`.

---

## 🚀 Quick Start

### 1. Installation

```bash
# Clone into Claude Code skills folder
git clone https://github.com/wray-lee/boss.git ~/.claude/skills/boss

# Generate agent definitions for ~/.claude/agents/
python -I ~/.claude/skills/boss/sync_agents.py

# Reload plugins inside Claude Code
/reload-plugins
```

### 2. Usage

```bash
# Workflow Mode (Recommended for predictable cost & strict execution)
/boss Refactor the authentication module and add comprehensive test coverage

# Subagent Mode (Recommended when the manager needs free-form orchestration)
/boss subagent Investigate intermittent memory leak under high load
```

---

## ⚙️ Configuration (`boss.json`)

```jsonc
{
  "manager": {
    "model": "glm[1m]",        // Manager: cost-effective reasoning model
    "effort": "high",
    "description": "Plans work, assigns tiers, reviews results, issues rework."
  },
  "tiers": {
    "efficient": {              // Handles 80% of mechanical tasks
      "model": "sub[1m]",
      "effort": "high",
      "maxConcurrent": 8,
      "description": "Cheap and fast. Edits, grep, file reading, formatting."
    },
    "default": {
      "model": "sub[1m]",
      "effort": "high",
      "maxConcurrent": 6,
      "description": "Standard engineering work, scoped features, unit tests."
    },
    "advanced": {               // Hardest problems only
      "model": "step5[1m]",
      "effort": "max",
      "maxConcurrent": 3,       // Strictly capped to protect rate limits
      "description": "Concurrency, security, cross-module architecture."
    }
  },
  "maxRounds": 5
}
```

Whenever you update `boss.json`:
```bash
python -I ~/.claude/skills/boss/sync_agents.py
```

---

## 📁 Repository Structure

```
boss/
├── SKILL.md              # Skill definition — protocol for the boss (main session)
├── boss.json             # Model, tier, effort, and concurrency config
├── boss.workflow.js      # Workflow mode: DAG runner, plan-execute-review loop
├── sync_agents.py        # Synchronizes boss.json → ~/.claude/agents/boss-*.md
├── strip_agent_name.py   # PreToolUse hook ensuring proper subagent resumes
├── LICENSE               # MIT License
└── README.md             # Trilingual documentation
```

---

## 🔧 Workflow Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     WORKFLOW MODE                        │
│                                                          │
│  Boss (You) ──── Brief ────▶ boss.workflow.js            │
│                                    │                     │
│                             ┌──────▼──────┐              │
│                             │   Manager   │              │
│                             │  (Planning) │              │
│                             └──────┬──────┘              │
│                                    │ tasks + DAG         │
│                        ┌───────────┴───────────┐         │
│                        ▼                       ▼         │
│                  [Task A (Fast)]         [Task B (Fast)] │
│                        │                       │         │
│                        └───────────┬───────────┘         │
│                                    ▼ depends_on          │
│                             [Task C (Hard)]              │
│                                    │                     │
│                             ┌──────▼──────┐              │
│                 rework? ───▶│   Manager   │◀─ repo state │
│                             │  (Reviewer) │              │
│                             └──────┬──────┘              │
│                                    │ verdict = done      │
│                                    ▼                     │
│                        Final Report ──▶ Boss Gate        │
└──────────────────────────────────────────────────────────┘
```

---

## 📄 License

Distributed under the [MIT License](LICENSE).

<div align="center">
<sub>Built for <a href="https://docs.anthropic.com/en/docs/claude-code">Claude Code</a> · Maximum token efficiency, uncompromising engineering quality 🚀</sub>
</div>
