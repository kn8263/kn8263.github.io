---
title: テンプレート記事
date: "2024-01-01T12:00:00+0900"
template: "post"
draft: false
category: "blog"
description: "これは記事のテンプレートです。このファイルをコピーして新しい記事を作成してください。"
tags:
  - "テンプレート"
  - "サンプル"
---

# テンプレート記事

これは記事のテンプレートです。

## 使い方

- このファイルをコピーして新しいファイル名に変更してください
- フロントマター（`---`で囲まれた部分）を編集してください
- 本文をMarkdown形式で記述してください

## フロントマターの説明

- `title`: 記事のタイトル
- `date`: 公開日時（ISO 8601形式）
- `template`: テンプレートタイプ（通常は"post"）
- `draft`: 下書きフラグ（`false`で公開、`true`で非公開）
- `category`: カテゴリ
- `description`: 記事の説明（SEO用）
- `tags`: タグのリスト
```markdown
---
title: テンプレート記事
date: "2026-01-01T12:00:00+0900"
template: "post"
draft: false
category: "blog"
description: "これは記事のテンプレートです。このファイルをコピーして新しい記事を作成してください。"
tags:
  - "テンプレート"
  - "サンプル"
---
```

## Markdown記法

通常のMarkdown記法が使用できます。

- **太字**
- *斜体*
- `コード`
- [リンク](https://example.com)

```typescript
// コードブロックも使用可能
const example = "Hello, World!";
```

## 画像
```
![画像の説明](sample.png)
```
![画像の説明](sample.png)

## Mermaid図

Mermaidを使用して図表を作成できます。

### フローチャート

```mermaid
flowchart TD
    A[開始] --> B{条件チェック}
    B -->|Yes| C[処理1]
    B -->|No| D[処理2]
    C --> E[終了]
    D --> E
```

### シーケンス図

```mermaid
sequenceDiagram
    participant A as ユーザー
    participant B as フロントエンド
    participant C as バックエンド
    participant D as データベース
    
    A->>B: リクエスト送信
    B->>C: API呼び出し
    C->>D: データ取得
    D-->>C: データ返却
    C-->>B: レスポンス返却
    B-->>A: 結果表示
```

### ガントチャート

```mermaid
gantt
    title プロジェクトスケジュール
    dateFormat  YYYY-MM-DD
    section 設計
    要件定義           :a1, 2024-01-01, 7d
    基本設計           :a2, after a1, 10d
    section 開発
    フロントエンド開発  :b1, after a2, 14d
    バックエンド開発    :b2, after a2, 14d
    section テスト
    結合テスト         :c1, after b1, 7d
    総合テスト         :c2, after c1, 5d
```

## PlantUML図

PlantUMLを使用して図表を作成できます。

### クラス図

```plantuml
@startuml
class User {
  -id: int
  -name: string
  -email: string
  +login()
  +logout()
}

class Order {
  -id: int
  -userId: int
  -total: decimal
  +calculateTotal()
  +submit()
}

User "1" --> "*" Order : places
@enduml
```

### シーケンス図

```plantuml
@startuml
!theme plain
skinparam defaultFontName "MS Gothic"
skinparam defaultFontSize 12

actor ユーザー
participant "フロントエンド" as Frontend
participant "バックエンド" as Backend
participant "データベース" as DB

ユーザー -> Frontend: ログインリクエスト
Frontend -> Backend: API呼び出し
Backend -> DB: 認証情報確認
DB --> Backend: 認証結果
Backend --> Frontend: レスポンス
Frontend --> ユーザー: ログイン結果表示
@enduml
```

### ユースケース図

```plantuml
@startuml
actor ユーザー
actor 管理者

ユーザー --> (製品一覧)
ユーザー --> (購入)
ユーザー --> (購入履歴)
管理者 --> (販売管理)
管理者 --> (受注管理)
管理者 --> (ユーザー管理)
@enduml
```
