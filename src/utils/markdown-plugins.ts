import { existsSync } from 'fs';

import rehypeShiki from '@leafac/rehype-shiki';
import type { Element } from 'hast';
import rehypeMathJaxSvg from 'rehype-mathjax/svg';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkMermaid from 'remark-mermaidjs';
// @ts-ignore - remark-sync-plantuml has default export but types may not reflect it
import remarkPlantUML from 'remark-sync-plantuml';
import { getHighlighter } from 'shiki';
import type { Node, Parent } from 'unist';
import { visit } from 'unist-util-visit';

// Mermaidコードブロックをdivで囲むプラグイン
export const addDivMermaidPlugin = () => {
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

// Chromeの実行パスを取得する関数
const getChromeExecutablePath = (): string | undefined => {
	// 環境変数が設定されている場合はそれを使用
	if (process.env.GoogleChromeExecutablePath) {
		return process.env.GoogleChromeExecutablePath;
	}

	// OSを検出してデフォルトパスを設定
	const { platform } = process;
	if (platform === 'win32') {
		// Windows環境の一般的なChromeのパス
		const possiblePaths = [
			'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
			'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
		];

		// 最初に見つかったパスを返す
		for (const path of possiblePaths) {
			if (existsSync(path)) {
				return path;
			}
		}

		// 見つからない場合はundefinedを返してpuppeteerに自動検出させる
		return undefined;
	}

	if (platform === 'darwin') {
		// macOS環境
		const macPath =
			'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
		return existsSync(macPath) ? macPath : undefined;
	}

	// Linux環境
	const linuxPath = '/opt/google/chrome/google-chrome';
	return existsSync(linuxPath) ? linuxPath : undefined;
};

// 画像パスを変換するプラグイン（Astroでは使用時に動的に適用）
export const transformImagePaths = (articleSlug: string) => () => {
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

// Shikiハイライターの初期化（キャッシュ付き）
let shikiHighlighter: Awaited<ReturnType<typeof getHighlighter>> | null = null;

export const getShikiHighlighter = async () => {
	if (!shikiHighlighter) {
		shikiHighlighter = await getHighlighter({
			theme: 'github-light',
		});
	}
	return shikiHighlighter;
};

// プラグインの設定
export const remarkPlugins = [
	remarkMath,
	remarkGfm,
	remarkPlantUML as any,
	addDivMermaidPlugin as any,
	[
		remarkMermaid,
		{
			launchOptions: {
				executablePath: getChromeExecutablePath(),
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
				gitGraph: mermaidOption,
				c4: mermaidOption,
			},
		} as any,
	],
];

// テーブルをdivで囲むrehypeプラグイン
export const wrapTablePlugin = () => {
	return (tree: Node) => {
		visit(
			tree,
			'element',
			(node: Element, index: number | undefined, parent?: Parent) => {
				if (node.tagName === 'table' && parent && typeof index === 'number') {
					const wrapper: Element = {
						type: 'element',
						tagName: 'div',
						properties: { className: ['table-container'] },
						children: [node],
					};
					// eslint-disable-next-line no-param-reassign
					parent.children[index] = wrapper;
				}
			},
		);
	};
};

export const rehypePlugins = async () => [
	[
		rehypeShiki,
		{
			highlighter: await getShikiHighlighter(),
		},
	],
	rehypeMathJaxSvg,
	wrapTablePlugin as any,
];
