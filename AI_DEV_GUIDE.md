

# AI Development Guide

このドキュメントは **AI（ChatGPT / Codex など）と共同開発する際のルール**を定義する。

このプロジェクトでは AI が実装を行う際、既存の設計ドキュメントを必ず参照する。

対象ドキュメント

- docs/rules.md
- docs/state.md
- docs/actions.md
- docs/architecture.md
- docs/socket-events.md

AI はこれらの仕様を **絶対的なソースオブトゥルース（Single Source of Truth）**として扱う。

---

# Project Structure

AI は以下のディレクトリ構造を前提にコードを生成する。

```
root
 ├ client
 │   └ src
 │
 ├ server
 │   └ src
 │
 ├ shared
 │   └ src
 │
 ├ docs
 ├ README.md
 └ .gitignore
```

---

# Responsibilities

## client

フロントエンド実装。

責務

- UI表示
- ユーザー入力
- socket通信
- GameState表示

クライアントは

```
GameState を直接変更しない
```

---

## server

ゲームロジック。

責務

- GameState管理
- アクション処理
- バリデーション
- ルーム管理

```
GameState の変更は server のみが行う
```

---

## shared

client / server 共通コード。

用途

- TypeScript 型
- GameState 型
- Socket Event 型

制約

```
UI依存コードを書かない
Node依存コードを書かない
```

---

# AI Code Generation Rules

AI はコード生成時に以下を守る。

### 1. 設計書優先

AI は推測でロジックを書かない。

必ず以下を参照する。

```
rules.md
state.md
actions.md
socket-events.md
```

---

### 2. GameState変更ルール

```
client
↓
socket event
↓
server validation
↓
actions
↓
GameState update
↓
broadcast
```

AI は **client から GameState を変更するコードを書いてはいけない。**

---

### 3. TypeScript 型共有

型は

```
shared/src
```

に定義する。

client / server はその型を import する。

例

```
import { GameState } from "shared/src/types/GameState"
```

---

### 4. Socket イベント

Socketイベントは

```
socket-events.md
```

に従う。

新しいイベントを作る場合

1. shared/src/socket/events.ts
2. server handler
3. client emit

の順に追加する。

---

### 5. State 更新ルール

GameState 更新は

```
actions
```

フォルダ内でのみ行う。

AI は以下を守る。

```
server/src/game/actions
```

以外で GameState を変更してはいけない。

---

# Coding Conventions

AI は次のスタイルでコードを書く。

### TypeScript

- strict mode
- 型定義を明確化

---

### 関数設計

1関数 = 1責務

例

```
takeDifferentTokens()
buyCard()
checkNobles()
```

---

### エラー処理

例

```
TOKEN_LIMIT_EXCEEDED
INVALID_TOKEN_SELECTION
NOT_ENOUGH_TOKENS
CANNOT_BUY_CARD
```

サーバは

```
actionError
```

を返す。

---

# Implementation Order

AI は以下の順で実装する。

```
1. shared types
2. server GameState
3. actions
4. socket handlers
5. client socket
6. client UI
```

---

# Forbidden Implementations

AI は以下を行ってはいけない。

```
client から GameState を変更
shared に UI コードを書く
shared に Node コードを書く
```

---

# Development Goal

このプロジェクトの目標

```
React Client
↓
Socket.IO
↓
Node Game Server
↓
GameState
```

すべてのゲームロジックは

```
server
```

で実行される。

クライアントは **表示レイヤーのみ**とする。