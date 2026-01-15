---
title: 静的/動的スニペットの活用
date: 2026-01-14T15:27:06+0900
template: post
draft: true
category: blog
description: VSCodeで静的/動的なスニペットを設定する方法まとめ
tags:
  - 拡張機能
  - VS Code
  - JavaScript
---
Visual Studio Code(以下VS Codeとする)の標準機能で静的、拡張機能で動的なスニペットの設定方法をまとめておきます。<br>

## そもそもスニペットって？
よく使うコードや文章のテンプレートを短いコマンドやキーワードで素早く挿入できる機能です。<br>
あらかじめ定義されているスニペットを利用する以外に、自分でスニペットを定義することもできます(ユーザースニペット)。
例えば、関数のひな形や定型文、Markdownの表などを一瞬で入力できるため、作業効率が大きく向上します。<br>
VSCodeなど多くのエディタにはスニペット機能が備わっており、自分用にカスタマイズして登録することもできます。<br>
静的スニペットはあらかじめ決まった内容を挿入、動的スニペットは入力時に自動生成・加工されるものになります。<br>


## VS Codeのユーザースニペットの種類
VS Codeでは、ファイルの種類(.txt, .md, など)ごとに**ユーザースニペット**を定義する方法と、<br>
共通のユーザースニペット(グローバルスニペット)を定義する方法の大きく2種類あります。


## 静的スニペット
### 設定方法
今回はmarkdown(.md)ファイルのスニペットを設定していきます。<br><br>
VSCode(CursorでもOK)でコマンドパレット(**Ctrl + Shift + P**)で**Snippets: Configure Snippets**を検索します。<br>
スニペットの構成一覧が表示されるので、今回は**Markdown**と入力すると、候補が表示されるので選択します。<br>
選択すると**VSCodeのパス/User/snippets/markdown.json**が開かれるので設定をしていきます。<br><br>


### 設定項目
```json:記述項目
{
  "スニペット名" : {
    "prefix": "プレフィックス名",
    "body" : [
      "出力する",
      "テキスト"
    ],
    "description" : "スニペットの説明文です。",
    "isFileTemplate" : true,
    "scope" : "javascript,typescript"
  }
}
```

| 項目           | 内容                                                                                           | 必須 |
| -------------- | ---------------------------------------------------------------------------------------------- | ---- |
| スニペット名   | 重複しなければ任意の名前で良いと思われます。                                                   | ✓    |
| prefix         | Intellisense でスニペットを選択するときに使用するプレフィックス。                              | ✓    |
| body           | 出力したいテキストをリスト形式で記載します。1つの場合はリストでなくても良い。                  | ✓    |
| description    | Intellisenseに表示されるスニペットの説明です。                                                 |      |
| isFileTemplate | ファイル全体を作成または置換する場合のみ使用する（らしい）。Bool                               |      |
| scope          | グローバル（global.code-snipets.json）な設定の場合に対象となるファイルを特定したい場合に記述。 |      |

<br>
<br>

使用例：
```json:抜粋
{
  "details": {
    "prefix": "mddetails",
    "body": [
      "<details><summary>${1:タイトル}</summary>",
      "",
      "${2:本文}",
      "</details>"
    ],
    "description": "details/summary 折り畳みブロック"
  },
}
```

上記のスニペットを呼び出す際は、prefixの**mddetails**をmarkdownファイル内で打ち込むと使用できます。<br>
以下は**mdde**まで入力した時の表示です。
![intelisense](md1.png)
ここでEnter/Tabをおすと以下のように反映されます。
![output](md2.png)

<br>
<br>

### 変数
ここでは実際に使用している変数だけ紹介しておきます。<br>

```markdown:変数
"date: ${CURRENT_YEAR}-${CURRENT_MONTH}-${CURRENT_DATE}T${CURRENT_HOUR}:${CURRENT_MINUTE}:${CURRENT_SECOND}+0900"
```


| 変数           | 値                         |
| -------------- | -------------------------- |
| CURRENT_YEAR   | 現在の年西暦4桁            |
| CURRENT_MONTH  | 現在の月2桁                |
| CURRENT_DATE   | 現在の日2桁                |
| CURRENT_HOUR   | 現在の時刻 時24時間表記2桁 |
| CURRENT_MINUTE | 現在の時刻 分              |
| CURRENT_SECOND | 現在の時刻 秒              |

詳細は割愛しますが、スニペット内で使用できる変数もいくつか用意されていますので興味があればご確認ください。
[>公式ドキュメント](https://code.visualstudio.com/docs/editing/userdefinedsnippets#_variables)

### 私の設定
<details><summary>私の設定内容</summary>

```json:markdown.json
{
  "codeblock": {
    "prefix": "mdcode",
    "body": [
      "```txt:plane.txt",
      "$1",
      "```"
    ],
    "description": "新しいMarkdownコードブロックを追加"
  },
  "table": {
    "prefix": "mdtable",
    "body": [
      "| ${1:見出し1} | ${2:見出し2} |",
      "| :---: | :---: |",
      "|       |       |"
    ],
    "description": "Markdownテーブルのひな形を挿入"
  },
  "link": {
    "prefix": "mdlink",
    "body": [
      "[${1:リンクテキスト}](${2:URL})"
    ],
    "description": "Markdownリンクを挿入"
  },
  "innerlink": {
    "prefix": "mdinnerlink",
    "body": [
      "[${1:リンクテキスト}](#${2:見出し名をkebabケースで入力})"
    ],
    "description": "記事内リンク（アンカーリンク）を挿入"
  },
  "image": {
    "prefix": "mdimg",
    "body": [
      "![${1:alt}](${2:path})"
    ],
    "description": "Markdown画像を挿入"
  },
  "details": {
    "prefix": "mddetails",
    "body": [
      "<details><summary>${1:タイトル}</summary>",
      "",
      "${2:本文}",
      "</details>"
    ],
    "description": "details/summary 折り畳みブロック"
  },
  "article": {
    "prefix": "mdarticletemplate",
    "body": [
      "---",
      "title: ${1:タイトル}",
      "date: ${CURRENT_YEAR}-${CURRENT_MONTH}-${CURRENT_DATE}T${CURRENT_HOUR}:${CURRENT_MINUTE}:${CURRENT_SECOND}+0900",
      "template: post",
      "draft: true",
      "category: blog",
      "description: ${2:記事の要約}",
      "tags:",
      "  - PHP",
      "  - Laravel",
      "---",
      "",
      "記事の簡単な説明",
      "",
      "## 見出し"
    ],
    "description": "マークダウン記事のテンプレート"
  },
  "mermaid-flowchart-td": {
    "prefix": "mdmermaidtd",
    "body": [
      "```mermaid",
      "%%{init: {'theme':'base','flowchart': {'htmlLabels': false}}}%%",
      "flowchart TD",
      "    A[\"A\nA\"] --> B[\"B\nB\"]",
      "    B --> C[\"C\"]",
      "    C --> D[\"D\"]",
      "    C --> E[\"E\"]",
      "    D --> F[\"F\"]",
      "    ",
      "    style A fill:#fff3e0,stroke:#e65100",
      "    style B fill:#f3e5f5,stroke:#4a148c",
      "    style C fill:#e8f5e9,stroke:#1b5e20",
      "```"
    ],
    "description": "Mermaid: top down フローチャートスニペット"
  },
  "article-datetime": {
    "prefix": "mddatetime",
    "body": "${CURRENT_YEAR}-${CURRENT_MONTH}-${CURRENT_DATE}T${CURRENT_HOUR}:${CURRENT_MINUTE}:${CURRENT_SECOND}+0900",
    "description": "マークダウン記事の日付出力"
  },
  "footnote": {
    "prefix": "mdfootnote",
    "body": [
      "${1:脚注}[^${2:footnote}]\n\n[^${2:footnote}]: ${3:ここに脚注に内容}"
    ],
    "description": "脚注を挿入"
  }
}
```
</details>


## 動的スニペット
動的スニペットは静的スニペットと異なり、スニペット実行時にJavaScriptを用いた動的生成・加工が可能になります。<br>
例えば「選択中のテキストやファイルパスを自動で挿入」「複雑なテーブルやリストを変数に基づいて生成」「パラメータや日付による分岐出力」など、静的スニペットでは難しい⾃動化・応⽤⽣成が実現できます。<br>

### 拡張機能 HyperSnipsについて
HyperSnipsとは、動的スニペットを実現するVS Codeの拡張機能のひとつです。<br>
[HyperSnips - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=draivin.hsnips&ssr=false#overview)<br>
[HyperSnips - Github repository](https://github.com/draivin/hsnips)<br>

以下は実際に定義した動的スニペットの使用例です。
<img alt="画像名" src="/assets/images/posts/how_to_snipets/snippet.gif" style="width:50%; margin: 1rem 0;">

`t[列数]x[行数]`を入力しTabを押すと、指定した列数・行数のMarkdown形式のテーブルが出力されるスニペットです。<br>
<br>
※セパレーターの色が違うのはスニペットとは関係ありません。VS Codeの表示設定です。

### 設定方法
```diff
- console.log
+ console.diff
```

```javascript:diff
- console.log("log")console.log("log")console.log("log")console.log("log")console.log("log")console.log("log")console.log("log")console.log("log")console.log("log")
+ console.warn("warn")
```
```python:diff_diff.py
class test
- print
+ logger
```
