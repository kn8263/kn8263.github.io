import rehypeShiki from '@leafac/rehype-shiki';
import rehypeMathJaxSvg from 'rehype-mathjax/svg';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkMermaid from 'remark-mermaidjs';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkPlantUML from 'remark-sync-plantuml';
import { getHighlighter } from 'shiki';
// import { unified, Plugin } from 'unified';
import { unified } from 'unified';
import type { Node, Parent } from 'unist';
import { visit } from 'unist-util-visit';

// const addDivMermaidPlugin: Plugin = () => {
const addDivMermaidPlugin = () => {
	return (tree: Node, _file: any) => {
		visit(
			tree,
			(node: any) =>
				node.type === 'code' && 'lang' in node && node.lang === 'mermaid',
			(node: any, index: number | undefined, parent?: Parent) => {
				if (parent && typeof index === 'number') {
					const newHTML = {
						type: 'paragraph',
						children: [
							{
								type: 'html',
								value: '<div class="mermaid">',
							},
							node,
							{
								type: 'html',
								value: '</div>',
							},
						],
					};
					// eslint-disable-next-line no-param-reassign
					parent.children[index] = newHTML;
				}
			},
		);
	};
};

const mermaidOption = { useMaxWidth: false };

// 画像パスを変換するプラグイン
const transformImagePaths = (articleSlug: string) => () => {
	return (tree: Node) => {
		visit(tree, (node: any) => {
			if (node.type === 'image') {
				// 相対パスの場合、記事のスラッグに基づいて変換
				if (
					node.url &&
					!node.url.startsWith('http') &&
					!node.url.startsWith('/')
				) {
					// スラッグから記事名を取得
					const articleName = articleSlug
						.replace(/^posts\//, '')
						.replace(/^articles\//, '')
						.replace(/\.md$/, '')
						.replace(/\.tsx$/, '');

					// パスを変換
					// eslint-disable-next-line no-param-reassign
					node.url = `/assets/images/posts/${articleName}/${node.url}`;
				}
			}
		});
	};
};

export const markdownToHtml = async (
	markdown: string,
	articleSlug?: string,
) => {
	const processor = unified()
		.use(remarkParse)
		.use(remarkMath)
		.use(remarkGfm)
		.use(remarkPlantUML as any)
		.use(addDivMermaidPlugin as any);

	// スラッグが指定されている場合、画像パス変換プラグインを追加
	if (articleSlug) {
		processor.use(transformImagePaths(articleSlug) as any);
	}

	return (
		await processor
			.use(remarkMermaid, {
				launchOptions: {
					executablePath:
						process.env.GoogleChromeExecutablePath ??
						'/opt/google/chrome/google-chrome',
				},
				svgo: false,
				mermaidOptions: {
					flowchart: mermaidOption,
					sequence: mermaidOption,
					gantt: mermaidOption,
					journey: mermaidOption,
					timeline: mermaidOption,
					class: mermaidOption,
					state: mermaidOption,
					er: mermaidOption,
					pie: mermaidOption,
					requirement: mermaidOption,
					// mindmap: mermaidOption,
					gitGraph: mermaidOption,
					c4: mermaidOption,
				},
			} as any)
			.use(remarkRehype, { allowDangerousHtml: true, footnoteLabel: '脚注' })
			.use(rehypeShiki as any, {
				highlighter: await getHighlighter({
					theme: 'github-light',
				}),
			})
			.use(rehypeMathJaxSvg)
			.use(rehypeStringify, { allowDangerousHtml: true })
			.process(markdown)
	)
		.toString()
		.replace(/@@baseUrl@@/g, process.env.baseUrl || '');
};
