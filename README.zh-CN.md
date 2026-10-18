<div align="center">

# 🏢 Boss

### Claude Code 三层分级多智能体协同框架

**以极低的 Token 成本，换取逼近两级（2L）顶配的交付质量**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Skill-blueviolet?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTEyIDJMMyA3djEwbDkgNSA5LTVWN2wtOS01eiIvPjwvc3ZnPg==)](https://docs.anthropic.com/en/docs/claude-code)
[![Token 节约](https://img.shields.io/badge/Token_%E8%8A%82%E7%BA%A6-%E9%AB%98%E8%BE%BE_70%25-success)]()
[![Platform](https://img.shields.io/badge/Platform-Win%20%7C%20Mac%20%7C%20Linux-brightgreen)]()

<br/>

**[English](README.md)** | **[简体中文](README.zh-CN.md)** | **[日本語](README.ja.md)**

<br/>

```
                    ┌─────────┐
                    │  👔 Boss │ ← 主会话（你）：任务下达与最终质量把关
                    └────┬────┘
                         │ 任务需求 (Brief)
                    ┌────▼────┐
                    │📋Manager│ ← 中配推理模型（GLM/Sonnet）：拆解 DAG 并代码复审
                    └────┬────┘
        ┌────────────────┼────────────────┐
        │ 80% 机械化杂活  │ 15% 常规工程任务│ 5% 关键硬核攻坚
   ┌────▼───┐       ┌────▼───┐       ┌────▼────┐
   │⚡ Fast  │       │🔧 Mid  │       │🧠 Hard  │ ← 分级员工模型 (按需配置)
   │(极廉价) │       │(平衡型) │       │(顶配旗舰)│
   └────────┘       └────────┘       └─────────┘
```

</div>

---

## 💡 核心设计理念：为什么三级架构在性价比上完胜两级架构？

> 💡 **核心权衡**：“三级架构在极端峰值思维深度上可能略逊于全员顶配大模型的两级团队；但它能为你削减 60%~80% 的 Token 账单，并凭借严格的闭环审核达到逼近顶配的工程质量。”

在常规的多 Agent 方案中，**两级架构**（Boss 直接领导一批 Agent）往往存在两大痛点：
1. **Token 燃烧极其恐怖**：让 Claude Opus 或 Sonnet 开启最高推理来做 `grep` 查文件、改样式或写模板代码，属于严重的“高射炮打蚊子”。
2. **极易遭遇 Rate Limit 熔断 (429)**：多个高阶模型大并发会在十几分钟内耗光 Pro 配额，强制进入漫长冷却。

| 维度对比 | 传统两级架构 (2L: Boss → 全员) | 🏢 Boss 三级架构 (Boss → Manager → 分级员工) |
|:---|:---|:---|
| **模型分配** | 全员顶配大模型 (Opus / Fable) 跑所有任务 | **按需分级**：Manager 中等模型规划，80% 杂活用极廉价模型，仅关键难点上顶级模型 |
| **Token 消耗** | 💸 **极高**（简单查文件、改配置都花高昂费用） | 💰 **极低**（大幅节省 60%~80% Token 开销） |
| **限流风险 (Rate Limit)** | ⚠️ 极易触发 429 熔断（多高配并发耗尽配额） | 🛡️ **安全平稳**（廉价模型高并发，高配模型严格限额 `maxConcurrent ≤ 3`） |
| **最终交付质量** | 🌟 100% 顶配上限 | 🎯 **~90%+ 逼近质量**（借助 Manager 严审 + DAG 依赖 + 自动返工闭环弥补） |

---

## 🎯 角色与分工体系

| 角色 | 实体 | 核心职责 |
|:---:|:---:|:---|
| **👔 Boss（老板）** | 你（主会话） | 下达高阶任务目标与约束，执行最终质量门禁（Final Gate）。不插手中间琐碎派发。 |
| **📋 Manager（经理）** | 子代理 (`boss-manager`) | 读取代码现状、制定计划、拆解为有向无环图（DAG）、分配最省钱的员工层级、代码复审、发起返工。 |
| **🛠️ Employees（员工）** | 子代理 (`boss-employee-<tier>`) | 在指定层级执行具体工作，自行运行测试并提供结果证据，不越权修改无关文件。 |

---

## ✨ 核心特性

- 🎯 **分级模型调度** — 3 个可自由定义的员工层级（`efficient` / `default` / `advanced`），80% 的工作自动由轻量模型承接。
- 🔀 **支持两种模式**：
  - **Workflow 模式（默认）**：由 `boss.workflow.js` 驱动确定性的 DAG 执行，具备严格的并发槽控制与计划-执行-复审闭环。
  - **Subagent 模式**：经理自主编排，通过动态 Agent 调用实现灵活的探索或对抗审查。
- 🔄 **自动返工闭环（Auto-Rework）** — 经理根据实际代码库状态与测试证据严查员工结果，未达标自动生成针对性返工任务（最多 `maxRounds` 轮）。
- 🧩 **DAG 依赖管理** — 任务间支持 `depends_on` 依赖关系；独立任务自动并发，依赖任务等待前置输出。
- 🔒 **并发与限流防护** — 每层级独立配置 `maxConcurrent`，防止顶配模型并发击穿 API 配额。
- ⚙️ **配置极其简易** — 随时修改 `boss.json`，运行同步脚本即可全量更新。

---

## 🚀 快速上手

### 1. 安装

将仓库克隆至 Claude Code 的 skills 目录：

```bash
git clone https://github.com/wray-lee/boss.git ~/.claude/skills/boss
```

在 Claude Code 终端中重载插件（或重启会话）：

```
/reload-plugins
```

> 💡 **零额外配置 / 默认静默自动同步**：你 **完全无需** 手动运行任何 Python 脚本！首次运行 `/boss` 时，系统会自动检测并在后台静默完成智能体初始化。修改 `boss.json` 后也会自动在下次调用时自愈同步。（如果你喜欢显式手动初始化，也可以随时执行 `python -I ~/.claude/skills/boss/sync_agents.py`）。

### 2. 使用命令

```bash
# Workflow 模式（推荐：确定性 DAG + 严格控费）
/boss 重构 src/utils 模块并补充单元测试

# Subagent 模式（适合需要经理自由探索的疑难排查）
/boss subagent 调查并定位 issue #42 的根本原因
```

---

## ⚙️ 配置文件说明 (`boss.json`)

在 `boss.json` 中配置经理与员工各层级的模型、思考深度（effort）与并发限制：

```jsonc
{
  "manager": {
    "model": "glm[1m]",        // 经理模型：推荐高性价比推理模型
    "effort": "high"
  },
  "tiers": {
    "efficient": {              // 承担 80% 基础机械任务
      "model": "sub[1m]",
      "effort": "high",
      "maxConcurrent": 8,       // 允许较高并发
      "description": "Cheap and fast. Mechanical edits, searches, formatting, simple tests."
    },
    "default": {
      "model": "sub[1m]",
      "effort": "high",
      "maxConcurrent": 6,
      "description": "Normal engineering work. Scoped features, focused review, unit tests."
    },
    "advanced": {               // 仅攻坚硬核问题
      "model": "step5[1m]",
      "effort": "max",
      "maxConcurrent": 3,       // 严格限制并发，防止触发配额限制
      "description": "Hard problems. Concurrency, security, cross-module design."
    }
  },
  "maxRounds": 5                // 最大计划-执行-复审轮数
}
```

修改配置后，下次运行 `/boss` 会自动静默同步；你也可以选择手动执行同步：
```bash
python -I ~/.claude/skills/boss/sync_agents.py
```

---

## 📁 目录结构

```
boss/
├── SKILL.md              # 技能定义文件（Boss 主会话执行准则）
├── boss.json             # 核心配置：模型、层级、思考深度、并发上限
├── boss.workflow.js      # Workflow 引擎：DAG 调度器、并发槽与复审轮询
├── sync_agents.py        # 从 boss.json 生成 ~/.claude/agents/boss-*.md
├── strip_agent_name.py   # PreToolUse 钩子：避免经理生成具名信箱代理导致卡住
├── LICENSE               # MIT 开源许可证
├── README.md             # 英文文档 (English)
├── README.zh-CN.md       # 简体中文文档
└── README.ja.md          # 日本語ドキュメント
```

---

## 🔧 工作流生命周期

```
┌──────────────────────────────────────────────────────────┐
│                     WORKFLOW MODE                        │
│                                                          │
│  Boss (你) ──── 任务简报 ────▶ boss.workflow.js           │
│                                      │                   │
│                               ┌──────▼──────┐            │
│                               │   Manager   │            │
│                               │  (规划阶段) │            │
│                               └──────┬──────┘            │
│                                      │ 任务列表 + DAG    │
│                          ┌───────────┴───────────┐       │
│                          ▼                       ▼       │
│                    [任务 A (快速)]         [任务 B (快速)]│
│                          │                       │       │
│                          └───────────┬───────────┘       │
│                                      ▼ depends_on        │
│                               [任务 C (攻坚)]            │
│                                      │                   │
│                               ┌──────▼──────┐            │
│                   返工? ─────▶│   Manager   │◀─ 代码库真实│
│                               │  (复审阶段) │    状态/测试│
│                               └──────┬──────┘            │
│                                      │ verdict = done    │
│                                      ▼                   │
│                          最终汇报 ──▶ Boss 门禁          │
└──────────────────────────────────────────────────────────┘
```

---

## 📝 注意事项

- **顶级模型限并发**：若将 `advanced` 层级配置为 Opus / Fable / Astra 等顶级模型，务必保持 `maxConcurrent ≤ 3`，防止快速消耗交互式配额。
- **自定义层级**：层级名称完全自定义，你可以在 `boss.json` 中增删层级（如加入 `doc-writer` 等），脚本会自动同步生成。
- **防止死锁钩子**：`strip_agent_name.py` 自动过滤 `name` 参数，确保后台子代理能正常唤醒经理。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源。

<div align="center">
<sub>专为 <a href="https://docs.anthropic.com/en/docs/claude-code">Claude Code</a> 打造 · 极致节省 Token，稳定高质交付 🚀</sub>
</div>
