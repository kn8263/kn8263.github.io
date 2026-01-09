---
title: RAGについて
date: 2026-01-09T14:59:32+0900
template: post
draft: false
category: blog
description: RAG（Retrieval Augmented Generation）について
tags:
  - RAG
  - LLM
  - 生成AI
  - AWS
---
## RAGとは
RAG（Retrieval-Augmented Generation）は、AIが答えを作る前に**外部の情報（社内ドキュメント／ナレッジベースなど）を検索し、その情報を使って回答を生成する仕組み**です。これにより、単に大規模言語モデル（LLM）の記憶だけに頼るよりも**正確で最新の回答ができるようになります**。

### 【一般向けのイメージ】

学校の司書が質問に答える例でいうと：

1. **関連する本を探す（検索 = Retrieval）** riˈtrivəl
2. **本の内容を読んで整理する（拡張 = Augmented）** ɑɡˈmɛntəd
3. **その内容を自分の言葉で答える（生成 = Generation）** ˌʤɛnəˈreɪʃən

この「探す → 情報をまとめる → 答える」流れが、RAGの考え方です。

### 【仕組み：実務寄りの流れ（一般ケース）】

典型的なRAGパイプラインは大まかに次のようになります：

1. **外部データ（ドキュメント/社内資料/FAQなど）を用意**
2. 文書を小さなチャンクに分け、**埋め込みベクトル化**(Embedding)
3. **ベクトルデータベース**に保存（検索可能にする）
4. ユーザー質問をベクトル化し、類似度検索して関連情報を取得（Retrieval）
5. 取得情報を元にLLMにコンテキストを渡し、**応答を生成**（Generation）  
    → **これがRAGの主な構成要素と流れ**です。

### 【ポイント整理】

|項目|意味|
|---|---|
|Retrieval|外部情報を検索|
|Augmented|情報を追加・拡張|
|Generation|LLMが回答を生成|

→ RAGはこの3つのステップを組み合わせた**最新型AI応答設計**です。

---

AWS で RAG（FAQ 型）を本番稼働させる場合の**典型構成**は次のとおりです。

> **API（Lambda）＋ ベクトル検索（OpenSearch / Aurora / DynamoDB+Vector）＋ LLM（Bedrock or OpenAI）＋ S3**


## 【代表的なAWS構成（FAQ・RAG）】

#### ① 最もよくある標準構成（AWS公式寄り）

```txt
[ Frontend (CloudFront + S3 / React or Solid) ]
                |
                v
[ API Gateway ]
                |
                v
[ Lambda (Python + LangChain) ]
        |                |
        |                v
        |        [ Amazon Bedrock (LLM) ]
        |
        v
[ Amazon OpenSearch Serverless (Vector Search) ]
        |
        v
[ S3 (FAQ元データ) ]
```


#### 役割対応（ローカルとの比較）

| ローカル           | AWS                           | 役割                   |
| -------------- | ----------------------------- | -------------------- |
| FAISS          | OpenSearch Vector             | ベクトル検索               |
| Ollama / LLaMA | Bedrock（Claude, Llama, Titan） | LLM                  |
| CSV            | S3                            | ベクトルデータインデックス用のデータ原本 |
| Python Script  | Lambda                        | API                  |

#### Lambda（Python + LangChain）

Lambda が **RAG の司令塔** です。

Lambda内でやること：

1. 質問文を受け取る
2. Embedding生成
3. ベクトル検索
4. 関連FAQ取得
5. LLMに投げる
6. 回答を返す



#### ベクトル検索（FAISSの代替）

#### 選択肢①：Amazon OpenSearch Serverless（推奨）

- Vector Search ネイティブ対応
- スケール・運用不要
- FAQ 数千〜数十万件向き

#### 選択肢②：Aurora PostgreSQL + pgvector

- RDBと統合したい場合
- トランザクション管理が必要な時

#### 選択肢③：DynamoDB + Vector（新しめ）

- 完全サーバレス
- 検索性能は用途次第


### LLM（生成AI）

#### 選択肢①：Amazon Bedrock（AWS内完結）

- Claude
- LLaMA
- Titan
- IAM管理・監査が容易

#### 選択肢②：OpenAI API

- 精度重視
- コスト・外部通信あり


## 【インデックス構築（AWS版）】

ローカルの：
`python build_index.py`
は AWS では次のいずれかになります。
### パターン1：一時EC2 / ECSで実行

- FAQ更新時のみ起動
- OpenSearch にインデックス登録

### パターン2：Lambdaバッチ

- FAQ更新イベントで自動再構築
- 小規模向き


【全体の処理フロー】
```
ユーザー質問
   ↓
Frontend
   ↓
API Gateway
   ↓
Lambda
   ↓
Embedding生成
   ↓
OpenSearchで類似FAQ検索
   ↓
FAQ + 質問を LLM に渡す
   ↓
回答生成
   ↓
ユーザーへ返却
```


## 【考えられる具体的内容】

### ✔ 1. ベクトルデータベースを準備して RAG を実装

Lambda（Python 側）で：

- PDF・テキスト・DB のテキストを取得
- 文書をチャンク化して埋め込みベクトルに変換
- ベクトルストアに登録
- フロントからの質問を埋め込み→類似検索
- 検索結果を LLM へのコンテキストとしてプロンプト生成
- LLM を呼び出して回答生成

| 役割        | ローカル検証環境                                                                                      | AWS 本番環境                                       | 補足         |
| --------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------- |
| フロント      | Solid.js（dev server）                                                                          | S3 + CloudFront                                | SPAはそのまま   |
| API       | Python CLI / 仮API                                                                             | API Gateway                                    | HTTPS・認証   |
| 実行基盤      | Docker Compose                                                                                | AWS Lambda                                     | 実行形態が変わるだけ |
| RAG制御     | LangChain                                                                                     | LangChain                                      | 基本同一       |
| LLM       | Ollama + LLaMA                                                                                | Bedrock / OpenAI                               | 差し替えポイント   |
| Embedding | sentence-transformers 等                                                                       | Bedrock Embeddings / OpenAI Embeddings         | 別APIになる    |
| ベクトルストレージ | **FAISS** を使ってファイルとしてベクトルインデックスを管理<br>※FAISS（Local Vector Store）<br>　ベクトルを **ローカルファイル** として保存 | **S3 Vectors**, OpenSearch, Pinecone, Weaviate |            |
| ベクトル検索    | FAISS（ローカル）                                                                                   | OpenSearch / Aurora                            | **最大の違い**  |
| FAQ元データ   | CSV                                                                                           | S3                                             | 保存先変更      |
| インデックス作成  | build_index.py                                                                                | バッチLambda / ECS                                | 実行場所が違う    |

### ベクトルストレージ、Embeddingについて
- Embedding  
    → **テキスト → 数値に変換**
- Vector Store  
    → **数値を高速検索できる形で保存**

※AWSでは両方が Bedrock/OpenSearch に吸収されて見える

|観点|FAISS|S3 Vectors / OpenSearch|
|---|---|---|
|役割|検索エンジン|検索 + 永続 + 運用|
|保存|ファイル|マネージド|
|再構築|手動|イベント駆動可|
|バックアップ|自前|自動|


### 他補足

|役割|ローカル検証環境|AWS 本番環境|補足|
|---|---|---|---|
|設定管理|`.env` / compose.yml|SSM Parameter Store / Secrets Manager|APIキー・モデル名|
|認証・認可|なし|Cognito / IAM / JWT|FAQでも必須になること多い|
|ログ|stdout / print|CloudWatch Logs|LLMの誤動作検知|
|監視|なし|CloudWatch Metrics / Alarms|レイテンシ・失敗率|
|エラーハンドリング|例外そのまま|API Gateway + Lambda制御|ユーザー向け整形|
|スケーリング|手動|Lambda / OpenSearch AutoScale|FAQ増加時|
|FAQ更新検知|手動実行|S3 Event / 管理画面|再インデックス起点|
|キャッシュ|なし|API Gateway / ElastiCache|LLMコスト削減|
|CI/CD|なし|GitHub Actions / CodePipeline|インデックス再生成含む|
## LangChain

**役割**：RAG全体のオーケストレーション  
**概要**：
- LLM呼び出し
- ベクトル検索
- プロンプト組み立て
- RAG用QAチェーン  
    をまとめて扱えるフレームワーク。

**向いているケース**：
- 「検索 → LLM → 回答」を一気通貫で実装したい
- Lambda + Python で素早くRAGを組みたい

**特徴**：
- 対応LLM・DBが多い
- 実務での採用例が多い

[^1]: 
