<div align="center">

# 🏢 Boss

### Claude Code 向け三層階層型マルチエージェント協調フレームワーク

**圧倒的な低トークンコストで、2層（2L）最高峰構成に迫る品質を実現**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Skill-blueviolet?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTEyIDJMMyA3djEwbDkgNSA5LTVWN2wtOS01eiIvPjwvc3ZnPg==)](https://docs.anthropic.com/en/docs/claude-code)
[![Token 削減](https://img.shields.io/badge/Token_%E5%89%8A%E6%B8%9B-%E6%9C%80%E5%A4%A7_70%25-success)]()
[![Platform](https://img.shields.io/badge/Platform-Win%20%7C%20Mac%20%7C%20Linux-brightgreen)]()

<br/>

**[English](README.md)** | **[简体中文](README.zh-CN.md)** | **[日本語](README.ja.md)**

<br/>

```
                    ┌─────────┐
                    │  👔 Boss │ ← あなた（メインセッション）：要件指示と最終品質ゲート
                    └────┬────┘
                         │ ブリーフ
                    ┌────▼────┐
                    │📋Manager│ ← 中価格帯推論モデル（GLM/Sonnet）：DAG計画＆コード検証
                    └────┬────┘
        ┌────────────────┼────────────────┐
        │ 80% 定常作業    │ 15% 通常開発    │ 5% 高難度課題
   ┌────▼───┐       ┌────▼───┐       ┌────▼────┐
   │⚡ Fast  │       │🔧 Mid  │       │🧠 Hard  │ ← 階層別従業員モデル
   │(超低コスト)│     │(バランス)│      │(最高峰)  │
   └────────┘       └────────┘       └─────────┘
```

</div>

---

## 💡 コア設計思想：なぜ3層構造がコストパフォーマンスで圧倒的なのか？

> 💡 **コアトレードオフ**：「最高峰モデルを揃えた2層構成と比較すると、極限の推論深さではわずかに及ばない場面があるかもしれません。しかし、Bossはトークンコストを60〜80%削減しつつ、厳格な検証サイクルにより2層構成に迫る高品質な成果を達成します。」

従来のマルチエージェント環境における **2層構成**（BossがすべてのAgentを直接指示）には、2つの深刻な問題があります：
1. **トークンの激しい浪費**：ファイルの検索や軽微なコード修正、ログ確認にまでClaude OpusやSonnetの最高推論（xhigh）を使うのは極めて非効率です。
2. **レート制限（429）の頻発**：高額モデルを大量並列実行すると、わずか十数分でProの利用制限に達し、長時間の待機が発生します。

| 比較項目 | 従来の2層構成 (2L: Boss → 全員) | 🏢 Boss 3層構成 (Boss → Manager → 階層別) |
|:---|:---|:---|
| **モデル配分** | 全タスクに最高峰モデル（Opus/Sonnet）を投入 | **適材適所**：Managerが中価格モデルで計画、80%の雑務は超低コストモデル、難所のみ最高峰モデルを配備 |
| **トークン消費** | 💸 **極めて高額**（単純な検索や修正でも高額消費） | 💰 **大幅削減**（最大60%〜80%削減） |
| **制限リスク (Rate Limit)** | ⚠️ 高い（並列実行ですぐに429エラーが発生） | 🛡️ **安全運用**（低コストモデルは高並列、最高峰モデルは `maxConcurrent ≤ 3` に厳格制限） |
| **成果物の品質** | 🌟 100% 最高峰水準 | 🎯 **~90%+ 迫る品質**（Managerの厳格な検証＋DAG依存関係＋自動手戻しループでカバー） |

---

## 🎯 役割と分担

| 役割 | 実体 | 主な責務 |
|:---:|:---:|:---|
| **👔 Boss（上司）** | あなた（メインセッション） | 高度なタスク目標と制約を指示し、最終品質ゲート（Final Gate）を担当。細かなタスク配分には介入しません。 |
| **📋 Manager（管理者）** | サブエージェント (`boss-manager`) | コードを調査し、DAG（有向非巡回グラフ）としてタスクを分解。最も安価なティアへタスクを割り振り、成果を厳格に検証し、手戻り（Rework）を指示。 |
| **🛠️ Employees（従業員）** | サブエージェント (`boss-employee-<tier>`) | 指定されたティアでスコープ内の作業を実行。自らテストを実行してエビデンス（コマンド実行結果）を添えて報告。 |

---

## ✨ 主な特徴

- 🎯 **コスト最適化モデルルーティング** — 3つの設定可能ティア（`efficient` / `default` / `advanced`）により、日常業務の80%を軽量モデルに任せます。
- 🔀 **2つの実行モード**：
  - **Workflow モード（デフォルト）**：`boss.workflow.js` による確定的DAG実行。スロットベースの同時実行制御と計画・実行・検証ループ。
  - **Subagent モード**：Managerが自律的にエージェント呼び出しを行い、柔軟な探索や検証を実行。
- 🔄 **自動リワークループ（Auto-Rework）** — Managerがリポジトリの実状態やテスト結果を検証。不備があれば最大 `maxRounds` 回まで自動でリワークを発行。
- 🧩 **DAG依存関係管理** — タスク間で `depends_on` を定義可能。独立したタスクは最大並列で実行され、依存タスクは先行タスクの完了を待機。
- 🔒 **レート制限＆クォータ保護** — ティアごとの `maxConcurrent` 制限により、高価格モデルの並列実行による制限オーバーを防止。
- ⚙️ **簡単な設定管理** — `boss.json` を編集して同期スクリプトを実行するだけで反映完了。

---

## 🚀 クイックスタート

### 1. インストール

Claude Code の skills ディレクトリにクローンします：

```bash
git clone https://github.com/wray-lee/boss.git ~/.claude/skills/boss
```

Claude Code ターミナルでプラグインをリロードします（またはセッションを再起動）：

```
/reload-plugins
```

> 💡 **追加設定不要 / デフォルトで静的自動同期**：手動でPythonスクリプトを実行する必要は **一切ありません**！初回の `/boss` 実行時に、バックグラウンドで自動的にエージェント定義が初期化されます。（明示的に手動生成を行いたい場合は、いつでも `python -I ~/.claude/skills/boss/sync_agents.py` を実行可能です）。

### 2. 実行コマンド

```bash
# Workflow モード（推奨：確定的DAG＋徹底したコスト管理）
/boss src/utils モジュールをリファクタリングして単体テストを追加

# Subagent モード（原因究明などManagerの自由なオーケストレーションが必要な場合）
/boss subagent issue #42 の根本原因を調査して修正
```

---

## ⚙️ 設定ファイルの解説 (`boss.json`)

`boss.json` でManagerおよび各Employeeティアのモデル、推論深度（effort）、同時実行数を設定します：

```jsonc
{
  "manager": {
    "model": "glm[1m]",        // マネージャーモデル：高コスパな推論モデル推奨
    "effort": "high"
  },
  "tiers": {
    "efficient": {              // 80%の定常作業を担当
      "model": "sub[1m]",
      "effort": "high",
      "maxConcurrent": 8,       // 高並列可能
      "description": "Cheap and fast. Mechanical edits, searches, formatting, simple tests."
    },
    "default": {
      "model": "sub[1m]",
      "effort": "high",
      "maxConcurrent": 6,
      "description": "Normal engineering work. Scoped features, focused review, unit tests."
    },
    "advanced": {               // 難関課題専用
      "model": "step5[1m]",
      "effort": "max",
      "maxConcurrent": 3,       // レート制限防止のため厳格に制限
      "description": "Hard problems. Concurrency, security, cross-module design."
    }
  },
  "maxRounds": 5                // 最大ラウンド数（計画 → 実行 → レビュー）
}
```

設定変更後は次回の `/boss` 呼び出し時に自動同期されます。手動で即時反映させたい場合は以下を実行してください：
```bash
python -I ~/.claude/skills/boss/sync_agents.py
```

---

## 📁 ディレクトリ構成

```
boss/
├── SKILL.md              # スキル定義（Bossメインセッションの指示書）
├── boss.json             # コア設定：モデル、ティア、推論深度、同時実行数
├── boss.workflow.js      # ワークフロー実行エンジン：DAGスケジューラ
├── sync_agents.py        # boss.json から ~/.claude/agents/boss-*.md を自動生成
├── strip_agent_name.py   # PreToolUseフック：サブエージェント停止を防ぐ
├── LICENSE               # MIT ライセンス
├── README.md             # 英語ドキュメント (English)
├── README.zh-CN.md       # 簡体字中国語ドキュメント
└── README.ja.md          # 日本語ドキュメント
```

---

## 🔧 ワークフローのライフサイクル

```
┌──────────────────────────────────────────────────────────┐
│                     WORKFLOW MODE                        │
│                                                          │
│  Boss (あなた) ── 要件伝達 ──▶ boss.workflow.js          │
│                                      │                   │
│                               ┌──────▼──────┐            │
│                               │   Manager   │            │
│                               │   (計画)    │            │
│                               └──────┬──────┘            │
│                                      │ タスク＋DAG       │
│                          ┌───────────┴───────────┐       │
│                          ▼                       ▼       │
│                    [タスク A (高速)]       [タスク B (高速)]│
│                          │                       │       │
│                          └───────────┬───────────┘       │
│                                      ▼ depends_on        │
│                               [タスク C (難問)]          │
│                                      │                   │
│                               ┌──────▼──────┐            │
│                   再作業? ────▶│   Manager   │◀─ リポジトリ│
│                               │  (レビュー) │    の実状態 │
│                               └──────┬──────┘            │
│                                      │ verdict = done    │
│                                      ▼                   │
│                          最終報告 ──▶ Boss ゲート        │
└──────────────────────────────────────────────────────────┘
```

---

## 📝 注意事項

- **最高峰モデルの並列数**：`advanced` ティアに Opus / Fable などのフラグシップモデルを割り当てる場合、`maxConcurrent ≤ 3` に保つことで Claude Pro の 429 エラーを防ぎます。
- **カスタムティア**：ティア名は自由に変更可能です。`boss.json` で自由に追加・削除でき、同期スクリプトが自動生成します。
- **フックの役割**：`strip_agent_name.py` は、Managerが名前付きエージェントを作成して待機状態に陥るのを防ぎます。

---

## 📄 ライセンス

[MIT License](LICENSE) のもとで公開されています。

<div align="center">
<sub>Built for <a href="https://docs.anthropic.com/en/docs/claude-code">Claude Code</a> · トークン効率の最大化と高品質なエンジニアリングの両立 🚀</sub>
</div>
