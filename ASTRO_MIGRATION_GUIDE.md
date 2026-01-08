# Next.jsからAstroへの移行ガイド

このドキュメントは、Next.jsプロジェクトをAstroに移行するためのガイドです。

## 移行の概要

Astroは、コンテンツ中心のサイトに最適化された静的サイトジェネレーターです。Next.jsと比較して、以下の利点があります：

- より高速なビルド時間
- より小さなバンドルサイズ
- より良いSEO
- マークダウン中心のワークフロー

## 移行手順

### 1. Astroプロジェクトの初期化

```bash
# Astro CLIをインストール
npm create astro@latest

# または既存のプロジェクトに追加
npm install astro --save-dev
```

### 2. プロジェクト構造の変更

#### Next.jsの構造
```
src/
  pages/
    index.tsx
    about.tsx
    articles/
      article.tsx
  components/
  templates/
```

#### Astroの構造
```
src/
  pages/
    index.astro
    about.astro
    articles/
      article.astro
  components/
  layouts/
  content/
    posts/
      article.md
```

### 3. 主要なファイルの変換

#### package.jsonの更新

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "@astrojs/mdx": "^2.0.0",
    "@astrojs/react": "^3.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  }
}
```

#### astro.config.mjsの作成

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [react(), mdx(), tailwind()],
  output: 'static',
  site: 'https://kn8263.github.io',
  base: '/',
  trailingSlash: 'always',
});
```

### 4. コンポーネントの変換

#### Next.jsコンポーネント（例: Main.tsx）

```tsx
// Next.js版
import Link from 'next/link';
import { Sidebar } from './SideBar';

const Main = ({ children, recents, tags }) => (
  <div>
    <Sidebar recents={recents} tags={tags} />
    {children}
  </div>
);
```

#### Astroコンポーネント（例: Main.astro）

```astro
---
// Main.astro
interface Props {
  recents: PostItems[];
  tags: string[];
}

const { recents, tags, children } = Astro.props;
---

<div class="antialiased w-full text-black md:px-0 sm:flex min-h-screen">
  <Sidebar recents={recents} tags={tags} />
  <div class="mx-auto float-left px-3 w-full sm:w-3/4">
    <slot />
  </div>
</div>
```

### 5. ページの変換

#### Next.jsページ（例: index.tsx）

```tsx
import { GetStaticProps } from 'next';
import { Main } from '../templates/Main';

export const getStaticProps: GetStaticProps = async () => {
  const posts = getAllPosts();
  return { props: { posts } };
};

const Index = ({ posts }) => (
  <Main>
    <BlogGallery posts={posts} />
  </Main>
);
```

#### Astroページ（例: index.astro）

```astro
---
// index.astro
import Main from '../layouts/Main.astro';
import BlogGallery from '../components/BlogGallery.astro';
import { getAllPosts } from '../utils/content';

const posts = await getAllPosts();
---

<Main>
  <h1>レポート一覧</h1>
  <BlogGallery posts={posts} />
</Main>
```

### 6. マークダウンの処理

Astroでは、`@astrojs/mdx`を使用してMDXファイルを処理できます。

#### content/posts/example.md

```markdown
---
title: 記事のタイトル
date: 2024-01-01
description: 記事の説明
tags:
  - タグ1
  - タグ2
---

# 記事の内容

本文をここに記述します。
```

#### src/pages/posts/[...slug].astro

```astro
---
import { getCollection } from 'astro:content';
import PostLayout from '../../layouts/PostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
---

<PostLayout post={post}>
  <post.Content />
</PostLayout>
```

### 7. コンテンツコレクションの設定

#### src/content/config.ts

```typescript
import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  posts: postsCollection,
};
```

### 8. スタイリングの移行

Tailwind CSSは`@astrojs/tailwind`を使用してそのまま使用できます。

#### tailwind.config.mjs

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 9. GitHub Actionsの更新

#### .github/workflows/deploy.yml

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm install --frozen-lockfile
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 10. 主要な変更点

#### ルーティング

- Next.js: `pages/`ディレクトリベースのルーティング
- Astro: `src/pages/`ディレクトリベースのルーティング（ファイルベース）

#### データフェッチング

- Next.js: `getStaticProps`, `getStaticPaths`
- Astro: ページコンポーネント内で直接データ取得

#### コンポーネント

- Next.js: JSX/TSXコンポーネント
- Astro: `.astro`ファイル（HTMLテンプレート + フロントマター）

#### マークダウン

- Next.js: `gray-matter` + `unified`で処理
- Astro: `@astrojs/mdx`で自動処理

### 11. 移行チェックリスト

- [ ] Astroプロジェクトの初期化
- [ ] `package.json`の更新
- [ ] `astro.config.mjs`の作成
- [ ] コンポーネントの変換（`.tsx` → `.astro`）
- [ ] ページの変換（`.tsx` → `.astro`）
- [ ] レイアウトの変換
- [ ] マークダウンの処理方法の変更
- [ ] スタイリングの移行
- [ ] ビルド設定の更新
- [ ] GitHub Actionsの更新
- [ ] テストとデバッグ

### 12. 注意事項

1. **Reactコンポーネント**: Astroでは、Reactコンポーネントを使用する場合は`@astrojs/react`統合が必要です。また、クライアントサイドで動作させる場合は`client:load`などのディレクティブが必要です。

2. **動的インポート**: Next.jsの`dynamic`は、Astroでは`client:load`などのディレクティブで代替します。

3. **画像最適化**: Next.jsの`next/image`は、Astroでは`@astrojs/image`または`@astrojs/assets`を使用します。

4. **APIルート**: Next.jsのAPIルートは、Astroでは別の方法（サーバーレス関数など）で実装する必要があります。

5. **PWA**: Next.jsの`next-pwa`は、Astroでは`@vite-pwa/astro`を使用します。

### 13. 参考リソース

- [Astro公式ドキュメント](https://docs.astro.build/)
- [Astro移行ガイド](https://docs.astro.build/en/guides/migrate-to-astro/)
- [Astroコンテンツコレクション](https://docs.astro.build/en/guides/content-collections/)

## 次のステップ

1. このガイドに従って、段階的に移行を進めてください
2. 各ステップでテストを行い、問題がないか確認してください
3. 必要に応じて、既存の機能をAstroの機能に置き換えてください
