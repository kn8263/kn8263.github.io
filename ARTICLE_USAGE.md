# 記事の運用方法

このプロジェクトでは、2つの方法で記事を追加・管理できます。

## 1. マークダウンファイル（`_posts/`ディレクトリ）

### 概要
`_posts/`ディレクトリにマークダウンファイル（`.md`）を配置することで、シンプルな記事を作成できます。

### 使い方

1. `_posts/`ディレクトリに新しいマークダウンファイルを作成します
   - ファイル名は任意ですが、スラッグとして使用されます
   - 例: `my-article.md`

2. ファイルの先頭にフロントマターを記述します

```markdown
---
title: 記事のタイトル
date: "2024-01-01T12:00:00+0900"
template: "post"
draft: false
category: "blog"
description: "記事の説明（SEO用）"
tags:
  - "タグ1"
  - "タグ2"
---
```

3. 本文をMarkdown形式で記述します

```markdown
# 見出し

本文の内容をここに記述します。

- リスト項目1
- リスト項目2

\`\`\`typescript
// コードブロックも使用可能
const example = "Hello, World!";
\`\`\`
```

### 画像
1. `_posts_image`内にマークダウンと同じ名前のディレクトリを作成
2. そのディレクトリ内に画像を配置
3. マークダウン内でファイル名のみ使用

### 配置
```
_posts_image/
  └── my-article/
      ├── image1.jpg
      └── screenshot.png
```

### 書き方
```markdown
![画像の説明](image1.jpg)
![スクリーンショット](screenshot.png)
```

### 自動変換後
```html
<img src="/assets/images/posts/my-article/image1.jpg" alt="画像の説明">
<img src="/assets/images/posts/my-article/screenshot.png" alt="スクリーンショット">
```

### フロントマターの説明

| 項目 | 説明 | 必須 | デフォルト値 |
|------|------|------|--------------|
| `title` | 記事のタイトル | 必須 | - |
| `date` | 公開日時（ISO 8601形式） | 必須 | - |
| `template` | テンプレートタイプ | 任意 | "post" |
| `draft` | 下書きフラグ | 任意 | false |
| `category` | カテゴリ | 任意 | "blog" |
| `description` | 記事の説明（SEO用） | 任意 | - |
| `tags` | タグのリスト | 任意 | [] |

### アクセス方法
記事は `/posts/[ファイル名]/index.html` でアクセスできます。

例: `_posts/my-article.md` → `/posts/my-article/index.html`

## 2. Astroファイル（`src/pages/articles/`ディレクトリ）

### 概要
`src/pages/articles/`ディレクトリにAstroファイル（`.astro`）を配置することで、Reactコンポーネントを含む複雑な記事を作成できます。

### 使い方

1. `src/pages/articles/`ディレクトリに新しい`.astro`ファイルを作成します
   - ファイル名は任意ですが、スラッグとして使用されます
   - 例: `my-article.astro`

2. ファイルの先頭にフロントマターをTypeScriptコードとして記述します

```astro
---
import { format } from 'date-fns';
import Main from '../../layouts/Main.astro';
import { Content } from '../../content/Content';
import { PostPagination } from '../../pagination/PostPagination';
import {
	getAllPostsIncludeTSX,
	getRecentPosts,
	getTags,
} from '../../utils/Content';
import type { PostItems } from '../../types/Content';

// フロントマター（メタデータをTypeScript変数として定義）
const title = "記事のタイトル";
const date = "2024-01-28T12:00:00+0900";
const description = "記事の説明（SEO用）";
const tags = ['タグ1', 'タグ2'];
// @ts-ignore - Content.tsで読み取られるため保持（未使用警告を無視）
const category = 'blog';

// 前後の記事を取得
const recents = getRecentPosts(['title', 'date', 'slug']);
const mainTags = getTags();
const posts = getAllPostsIncludeTSX(['title', 'date', 'slug']);
const currentNumber = posts.map(({ slug }) => slug).indexOf('articles/my-article');
const prevPost: PostItems | null = posts[currentNumber - 1] ?? null;
const nextPost: PostItems | null = posts[currentNumber + 1] ?? null;
---
```

3. コンテンツ部分を記述します

```astro
<Main
	recents={recents}
	tags={mainTags}
	meta={{
		title,
		description,
		post: {
			date,
			modified_date: null,
			image: null,
		},
		url: '/articles/my-article/',
	}}
>
	<h1 class="content-title">{title}</h1>
	<div class="content-date">
		Posted {format(new Date(date), 'LLLL d, yyyy')}
	</div>

	<ul class="flex flex-row flex-wrap list-none p-0 m-2 justify-start">
		{tags.map((tag) => (
			<li
				class="px-2 py-1 m-1 rounded-full overflow-hidden shadow-md border-0 bg-white w-fit break-all"
			>
				<a href={`/tag/${tag}/index.html`}>
					#{tag}
				</a>
			</li>
		))}
	</ul>

	<Content client:load>
		<div>
			<p>記事の本文をここに記述します。</p>
			
			<h2>見出し</h2>
			<p>通常のHTMLやMarkdown記法が使用できます。</p>
			
			<ul>
				<li>リスト項目1</li>
				<li>リスト項目2</li>
			</ul>
			
			<pre><code class="language-typescript">// コードブロックも使用可能
const example = "Hello, World!";</code></pre>
		</div>
	</Content>

	<PostPagination nextPost={nextPost} prevPost={prevPost} client:load />
</Main>
```

### Reactコンポーネントの使用

Astroファイル内でReactコンポーネントを使用する場合は、`client:load`ディレクティブを使用します：

```astro
---
import ReactHelloWorld from '../../components/ReactHelloWorld/ReactHelloWorld';
---
<Content client:load>
	<div>
		<p>通常のコンテンツ</p>
		<ReactHelloWorld client:load>
			こんな感じでReactコンポーネントが使えます！✨
		</ReactHelloWorld>
	</div>
</Content>
```

### フロントマターの説明

| 項目 | 説明 | 必須 | デフォルト値 |
|------|------|------|--------------|
| `title` | 記事のタイトル（文字列） | 必須 | - |
| `date` | 公開日時（ISO 8601形式の文字列） | 必須 | - |
| `description` | 記事の説明（SEO用、文字列） | 任意 | - |
| `tags` | タグのリスト（配列） | 任意 | [] |
| `category` | カテゴリ（文字列） | 任意 | "blog" |

**注意**: `category`変数は`Content.ts`で読み取られるため、`@ts-ignore`コメントを追加して未使用警告を無視してください。

### アクセス方法
記事は `/articles/[ファイル名]/index.html` でアクセスできます。

例: `src/pages/articles/my-article.astro` → `/articles/my-article/index.html`

### テンプレートファイル

`src/pages/articles/template.astro`をコピーして新しい記事を作成することをお勧めします。

## マークダウンの機能

両方の方法で、以下のMarkdown機能が使用できます：

- **コードハイライト**: Shikiを使用したシンタックスハイライト
- **数式**: MathJaxを使用した数式表示
- **Mermaid図**: Mermaidを使用した図表作成
- **PlantUML**: PlantUMLを使用した図表作成
- **GFM**: GitHub Flavored Markdownのサポート

## 下書き機能

`draft: true` を設定すると、本番環境では記事が表示されません（開発環境では表示されます）。

## 注意事項

- ファイル名はURLのスラッグとして使用されるため、適切な命名規則に従ってください
- 日付はISO 8601形式（`YYYY-MM-DDTHH:mm:ss+0900`）で記述してください
- タグは配列形式で記述してください
- `.astro`ファイルを使用する場合は、Astroのテンプレート構文を使用してください
- Reactコンポーネントを使用する場合は、`client:load`ディレクティブを追加してください
- Astroファイルでは`key`属性は不要です（Reactとは異なります）
