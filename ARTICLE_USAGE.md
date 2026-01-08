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

## 2. TypeScript/TSXファイル（`src/pages/articles/`ディレクトリ）

### 概要
`src/pages/articles/`ディレクトリにTypeScript/TSXファイルを配置することで、Reactコンポーネントを含む複雑な記事を作成できます。

### 使い方

1. `src/pages/articles/`ディレクトリに新しいTSXファイルを作成します
   - ファイル名は任意ですが、スラッグとして使用されます
   - 例: `my-article.tsx`

2. ファイルの先頭にフロントマターをコメント形式で記述します

```tsx
/**
---
title: 記事のタイトル
date: "2024-01-28T12:00:00+0900"
template: "post"
type: "tsx"
draft: false
category: "blog"
description: "記事の説明（SEO用）"
tags:
  - "タグ1"
  - "タグ2"
---
*/
```

3. Reactコンポーネントとして記事を実装します

{% raw %}
```tsx
import { format } from 'date-fns';
import { GetStaticProps } from 'next';
import Link from 'next/link';

import { Content } from '../../content/Content';
import { Meta } from '../../layout/Meta';
import { PostPagination } from '../../pagination/PostPagination';
import { Main } from '../../templates/Main';
import {
  getPrevNextPost,
  getRecentPosts,
  getTags,
  PostItems,
} from '../../utils/Content';
import { markdownToHtml } from '../../utils/Markdown';

type ArticleProps = {
  recents: PostItems[];
  tags: string[];
  content: string;
  prevPost?: PostItems;
  nextPost?: PostItems;
};

const Article = (props: ArticleProps) => {
  return (
    <Main
      recents={props.recents}
      tags={props.tags}
      meta={
        <Meta
          title="記事のタイトル"
          description="記事の説明"
        />
      }
    >
      <h1 className="content-title">記事のタイトル</h1>
      <div className="content-date">
        Posted {format(new Date('2024-01-28T12:00:00+0900'), 'LLLL d, yyyy')}
      </div>
      <ul className="flex flex-row flex-wrap list-none p-0 m-2 justify-start">
        {['タグ1', 'タグ2'].map((tag) => (
          <li
            className="px-2 py-1 m-1 rounded-full overflow-hidden shadow-md border-0 bg-white w-fit break-all"
            key={tag}
          >
            <Link
              href={{
                pathname: '/tag/[tag]',
                query: { tag },
              }}
              as={`/tag/${tag}/index.html`}
            >
              #{tag}
            </Link>
          </li>
        ))}
      </ul>
      <Content>
        <div dangerouslySetInnerHTML={{ __html: props.content }} />
      </Content>
      <PostPagination nextPost={props.nextPost} prevPost={props.prevPost} />
    </Main>
  );
};

export const getStaticProps: GetStaticProps<ArticleProps> = async () => {
  const markdownContent = `
# 見出し

本文の内容をここに記述します。
  `;

  return {
    props: {
      recents: getRecentPosts(['title', 'date', 'slug']),
      tags: getTags(),
      content: await markdownToHtml(markdownContent),
      ...getPrevNextPost(__filename),
    },
  };
};

export default Article;
```
{% endraw %}

### アクセス方法
記事は `/articles/[ファイル名]/index.html` でアクセスできます。

例: `src/pages/articles/my-article.tsx` → `/articles/my-article/index.html`

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
- TSXファイルを使用する場合は、Reactコンポーネントとして実装する必要があります
