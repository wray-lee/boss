<div align="center">

# 🏢 Boss

### **Hierarchical Multi-Agent Delegation for Claude Code**

*Boss → Manager → Employees — like a real engineering org, but faster.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Skill-blueviolet?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTEyIDJMMyA3djEwbDkgNSA5LTVWN2wtOS01eiIvPjwvc3ZnPg==)](https://docs.anthropic.com/en/docs/claude-code)
[![Platform](https://img.shields.io/badge/Platform-Win%20%7C%20Mac%20%7C%20Linux-brightgreen)]()

<br/>

```
         ┌─────────┐
         │  👔 Boss │ ← You (main session) — final quality gate
         └────┬────┘
              │ brief
         ┌────▼────┐
         │📋Manager│ ← Plans, assigns tiers, reviews, reworks
         └────┬────┘
       ┌──────┼──────┐
       │      │      │
  ┌────▼──┐┌──▼───┐┌─▼─────┐
  │⚡ Fast ││🔧 Mid ││🧠 Hard │ ← Employee tiers (configurable)
  └───────┘└──────┘└───────┘
```

</div>

---

<details>
<summary><b>🇨🇳 中文</b></summary>

## 简介

**Boss** 是 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 的一个 skill（技能插件），实现了 **三层分级委派**架构：

| 角色 | 职责 |
|:---:|:---|
| **Boss（老板）** | 你的主会话。下达任务，做最终质量把关 |
| **Manager（经理）** | 子代理。阅读代码、制定计划、分配任务到各层级员工、审核结果、发起返工 |
| **Employee（员工）** | 子代理。按指定层级执行具体工作，自行验证后汇报 |

### ✨ 核心特性

- 🎯 **分级调度** — 3 个可配置层级（fast / default / advanced），按任务难度自动分配最经济的模型
- 🔀 **两种模式** — Workflow 模式（确定性 DAG 调度）和 Subagent 模式（经理自主编排）
- 🔄 **自动返工** — 审核不通过自动发起 rework，最多 `maxRounds` 轮
- 🧩 **DAG 依赖** — 任务间声明 `depends_on`，独立任务自动并行
- 🔒 **并发控制** — 每层级独立的 `maxConcurrent` 限制，防止配额耗尽
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
/boss 重构 src/utils 模块，添加单元测试          # workflow 模式（默认）
/boss subagent 调查并修复 issue #42 的根因       # subagent 模式
```

### ⚙️ 配置

编辑 `boss.json` 修改模型、effort、并发数、层级名称。改完后运行：

```bash
python -I ~/.claude/skills/boss/sync_agents.py
```

</details>

---

<details>
<summary><b>🇯🇵 日本語</b></summary>

## 概要

**Boss** は [Claude Code](https://docs.anthropic.com/en/docs/claude-code) のスキルプラグインで、**三層階層型委任**アーキテクチャを実装しています：

| 役割 | 責務 |
|:---:|:---|
| **Boss（上司）** | メインセッション。タスクを指示し、最終品質ゲートを担当 |
| **Manager（管理者）** | サブエージェント。コード調査・計画立案・ティア別タスク割当・レビュー・手戻し指示 |
| **Employee（従業員）** | サブエージェント。指定ティアで具体的な作業を実行し、自己検証後に報告 |

### ✨ 主な特徴

- 🎯 **ティア別ディスパッチ** — 3つの設定可能なティア（fast / default / advanced）、タスク難易度に応じて最もコスト効率の良いモデルを自動選択
- 🔀 **2つのモード** — Workflowモード（決定的DAGスケジューリング）と Subagentモード（マネージャー自律型オーケストレーション）
- 🔄 **自動リワーク** — レビュー不合格時に自動でリワークを発行、最大 `maxRounds` ラウンド
- 🧩 **DAG依存関係** — タスク間で `depends_on` を宣言、独立タスクは自動並列実行
- 🔒 **同時実行制御** — ティアごとの `maxConcurrent` 制限でクォータ枯渇を防止
- ⚙️ **ワンステップ設定** — `boss.json` を編集 → `sync_agents.py` を実行 → 完了

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
/boss src/utilsモジュールをリファクタリングし、ユニットテストを追加    # workflowモード（デフォルト）
/boss subagent issue #42 の根本原因を調査して修正                 # subagentモード
```

### ⚙️ 設定

`boss.json` を編集してモデル、effort、同時実行数、ティア名を変更。変更後：

```bash
python -I ~/.claude/skills/boss/sync_agents.py
```

</details>

---

## Overview

**Boss** is a [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skill that implements **three-tier hierarchical delegation** — modeled after how real engineering organizations work:

| Role | Responsibility |
|:---:|:---|
| **Boss** | Your main session. Hands off tasks and does the final quality gate |
| **Manager** | Subagent. Reads the codebase, plans, dispatches tasks to tiered employees, reviews results, issues rework |
| **Employees** | Subagents. Execute scoped work at their assigned tier, self-verify, and report back |

## ✨ Features

- 🎯 **Tiered dispatch** — 3 configurable tiers (`efficient` / `default` / `advanced`), each with its own model, effort, and concurrency cap. The manager picks the cheapest tier that fits each task.
- 🔀 **Two modes** — **Workflow mode** (deterministic DAG scheduling via `boss.workflow.js`) and **Subagent mode** (the manager orchestrates freely with Agent calls).
- 🔄 **Auto-rework** — The manager reviews employee output against the actual repo state. Failed checks trigger rework tasks, up to `maxRounds`.
- 🧩 **DAG dependencies** — Tasks declare `depends_on`; independent tasks run in parallel automatically.
- 🔒 **Concurrency control** — Per-tier `maxConcurrent` slots prevent quota exhaustion on rate-limited models.
- ⚙️ **One-step config** — Edit `boss.json`, run `sync_agents.py`, done.

## 🚀 Installation

```bash
# Clone into your Claude Code skills directory
git clone https://github.com/wray-lee/boss.git ~/.claude/skills/boss

# Generate agent definition files
python -I ~/.claude/skills/boss/sync_agents.py

# Reload plugins (inside Claude Code)
/reload-plugins
```

## 📖 Usage

```
/boss refactor src/utils and add unit tests          # workflow mode (default)
/boss subagent investigate and fix root cause of #42  # subagent mode
```

### Workflow Mode (default)

The boss reads `boss.json`, launches `boss.workflow.js` via the Workflow tool. The script asks the manager to **plan** (structured output with task list), **executes** tasks as a dependency-aware DAG with per-tier concurrency caps, then asks the manager to **review**. Rework loops automatically.

```
Plan → Execute (parallel DAG) → Review → Rework? → ... → Final Report
```

### Subagent Mode

The boss launches a single manager subagent. The manager dispatches employees itself using Agent calls and can use any orchestration pattern — adversarial verify, staged escalation, etc.

```
/boss subagent <your task here>
```

## ⚙️ Configuration

Edit `boss.json` to customize models, tiers, effort levels, and concurrency:

```jsonc
{
  "manager": {
    "model": "glm[1m]",        // manager model
    "effort": "high"
  },
  "tiers": {
    "efficient": {              // tier name (free-form)
      "model": "sub[1m]",
      "effort": "high",
      "maxConcurrent": 8,       // max parallel agents of this tier
      "description": "Cheap and fast. Mechanical edits, searches, ..."
    },
    "default": { ... },
    "advanced": {
      "model": "step5[1m]",
      "effort": "max",
      "maxConcurrent": 3        // keep top-tier models low
    }
  },
  "maxRounds": 5                // max plan → execute → review cycles
}
```

After editing:

```bash
python -I ~/.claude/skills/boss/sync_agents.py
```

This regenerates `~/.claude/agents/boss-manager.md` and `boss-employee-<tier>.md` for each tier. Reload with `/reload-plugins` or restart the session.

## 📁 File Structure

```
boss/
├── SKILL.md              # Skill definition — instructions for the boss (main session)
├── boss.json             # Configuration: models, tiers, effort, concurrency
├── boss.workflow.js      # Workflow script: DAG scheduler with plan/execute/review loop
├── sync_agents.py        # Generates ~/.claude/agents/boss-*.md from boss.json
├── strip_agent_name.py   # PreToolUse hook: prevents named Agent calls in manager
├── LICENSE
└── README.md
```

## 🔧 How It Works

```
┌──────────────────────────────────────────────────────────┐
│                     WORKFLOW MODE                        │
│                                                          │
│  Boss ──brief──▶ Workflow engine                        │
│                    │                                     │
│              ┌─────▼─────┐                               │
│              │  Manager   │ plan (read-only + schema)    │
│              │  (GLM)     │◀────────────────┐            │
│              └─────┬──┬──┘                  │            │
│         DAG runner │  │ review              │ rework?    │
│     ┌──────────────┘  └─────────────────────┘            │
│     │                                                    │
│     │  acquire(tier) → run → release(tier)              │
│     ├──▶ employee-efficient ──┐                          │
│     ├──▶ employee-efficient   ├──▶ depends_on ──▶ ...   │
│     └──▶ employee-advanced  ──┘                          │
│                                                          │
│  Final report ──▶ Boss gate ──▶ User                    │
└──────────────────────────────────────────────────────────┘
```

## 📝 Notes

- **Top-tier models** (Opus / Fable / Astra) should keep `maxConcurrent ≤ 3` to avoid rate limits on interactive quotas.
- **Tier names are free-form** — add, rename, or remove tiers in `boss.json`; `sync_agents.py` follows.
- The `strip_agent_name.py` hook prevents the manager from accidentally creating named agents (which become mailbox teammates and never return results).
- Employees inherit your `CLAUDE.md` rules automatically.

## 📄 License

[MIT](LICENSE)

---

<div align="center">
<sub>Built for <a href="https://docs.anthropic.com/en/docs/claude-code">Claude Code</a> · Orchestrate smarter, not harder 🚀</sub>
</div>
