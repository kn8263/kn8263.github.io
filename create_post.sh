#!/bin/bash

# 標準入力からファイル名とタイトルを取得
echo "ファイル名を入力してください（拡張子は不要）:"
read -r FILENAME

echo "タイトルを入力してください:"
read -r TITLE

# 入力値のチェック
if [ -z "$FILENAME" ] || [ -z "$TITLE" ]; then
    echo "エラー: ファイル名とタイトルは必須です。"
    exit 1
fi

# ファイル名に拡張子が含まれている場合は削除
FILENAME=$(echo "$FILENAME" | sed 's/\.md$//')

# 出力ファイルパス
OUTPUT_FILE="_posts/${FILENAME}.md"

# ファイルが既に存在するかチェック
if [ -f "$OUTPUT_FILE" ]; then
    echo "エラー: ファイル $OUTPUT_FILE は既に存在します。"
    exit 1
fi

# 現在の日時をISO 8601形式で取得（+0900タイムゾーン）
DATE=$(date +"%Y-%m-%dT%H:%M:%S%z")

# テンプレートファイルをUTF-8エンコーディングで作成
cat << EOF | iconv -f UTF-8 -t UTF-8 > "$OUTPUT_FILE"
---
title: ${TITLE}
date: ${DATE}
template: post
draft: true
category: blog
description: 記事の要約
tags:
  - sample
  - sample2
---

記事の簡単な説明

## 1
EOF

echo "記事テンプレートを作成しました: $OUTPUT_FILE"
