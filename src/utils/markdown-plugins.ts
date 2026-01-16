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
						.replace(/\.tsx$/, '')
						.replace(/\.astro$/, '');

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
			theme: 'github-dark',
		});
	}
	return shikiHighlighter;
};

// コードブロックのメタデータ（ファイル名など）を保存するremarkプラグイン
export const extractCodeBlockMetaPlugin = () => {
	return (tree: Node) => {
		visit(tree, 'code', (node: any) => {
			// 言語が指定されていない場合、textを設定
			const codeNode = node;
			if (!codeNode.lang) {
				// eslint-disable-next-line no-param-reassign
				codeNode.lang = 'text';
			}

			// メタデータをdata属性として保存
			// 例: ```typescript:filename.ts -> lang="typescript", meta="filename.ts"
			// eslint-disable-next-line no-param-reassign
			codeNode.data = codeNode.data || {};
			// eslint-disable-next-line no-param-reassign
			codeNode.data.hName = 'code';
			// eslint-disable-next-line no-param-reassign
			codeNode.data.hProperties = codeNode.data.hProperties || {};

			let { lang } = codeNode;
			let filename: string | null = null;

			// langに`:`が含まれている場合、言語とファイル名を分離
			// 例: "typescript:filename.ts" -> lang="typescript", filename="filename.ts"
			if (lang.includes(':')) {
				const parts = lang.split(':');
				const [firstPart, ...restParts] = parts;
				lang = firstPart;
				filename = restParts.join(':'); // 複数の`:`がある場合に対応
			}

			// metaプロパティがある場合、それを使用（優先）
			if (codeNode.meta) {
				const meta = codeNode.meta.trim();
				if (meta) {
					filename = meta;
				}
			}

			// 言語情報を保存（分離後の言語名）
			// eslint-disable-next-line no-param-reassign
			codeNode.data.hProperties['data-lang'] = lang;

			// ファイル名がある場合、保存
			if (filename) {
				// eslint-disable-next-line no-param-reassign
				codeNode.data.hProperties['data-meta'] = filename;
			}

			// diff形式の検出とdata-diff-mode属性の設定
			// {言語}:diff や {言語}:diff_{ファイル名} 形式の場合
			if (filename && (filename === 'diff' || filename.startsWith('diff_'))) {
				// eslint-disable-next-line no-param-reassign
				codeNode.data.hProperties['data-diff-mode'] = 'with-bg';
			}
			// diff や diff:差分 形式の場合
			else if (lang === 'diff') {
				// eslint-disable-next-line no-param-reassign
				codeNode.data.hProperties['data-diff-mode'] = 'text-only';
			}

			// node.langも分離後の言語名に更新（rehypeShikiに正しい言語名を渡すため）
			// eslint-disable-next-line no-param-reassign
			codeNode.lang = lang;
		});
	};
};

// プラグインの設定
export const remarkPlugins = [
	remarkMath,
	remarkGfm,
	remarkPlantUML as any,
	addDivMermaidPlugin as any,
	extractCodeBlockMetaPlugin as any,
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

// rehypeShikiの前に言語情報をpre要素に保存し、code要素のクラス名を修正するプラグイン
export const preserveCodeBlockLangPlugin = () => {
	return (tree: Node) => {
		visit(tree, 'element', (node: Element) => {
			// <pre><code class="language-xxx">の構造を検出
			if (
				node.tagName === 'pre' &&
				node.children &&
				Array.isArray(node.children)
			) {
				const codeElement = node.children.find(
					(child: any) => child.type === 'element' && child.tagName === 'code',
				) as Element | undefined;

				if (codeElement && codeElement.properties) {
					// 言語情報を取得（クラス名から優先的に取得）
					let lang: string | null = null;
					let filename: string | null = null;

					// まずクラス名から取得（remark-rehypeで変換された後も保持される）
					if (
						codeElement.properties.className &&
						typeof codeElement.properties.className === 'object' &&
						Array.isArray(codeElement.properties.className)
					) {
						const langClass = codeElement.properties.className.find(
							(cls: any) =>
								typeof cls === 'string' && cls.startsWith('language-'),
						);
						if (langClass) {
							const langValue = String(langClass).replace('language-', '');
							// `:`が含まれている場合、言語とファイル名を分離
							if (langValue.includes(':')) {
								const parts = langValue.split(':');
								const [firstPart, ...restParts] = parts;
								lang = firstPart;
								filename = restParts.join(':');
							} else {
								lang = langValue;
							}
						}
					}

					// data属性から取得（フォールバック）
					if (!lang && codeElement.properties['data-lang']) {
						lang = String(codeElement.properties['data-lang']);
					}

					// メタデータ（ファイル名）を取得（data属性から優先）
					if (codeElement.properties['data-meta']) {
						filename = String(codeElement.properties['data-meta']);
					}

					// data-diff-mode属性を取得
					// remark-rehypeで変換された後、data.hPropertiesがpropertiesに反映される
					let diffMode: string | null = null;
					if (codeElement.properties['data-diff-mode']) {
						diffMode = String(codeElement.properties['data-diff-mode']);
					}
					// data属性からも確認（フォールバック）
					else if ((codeElement as any).data?.hProperties?.['data-diff-mode']) {
						diffMode = String(
							(codeElement as any).data.hProperties['data-diff-mode'],
						);
					}

					// code要素のクラス名を修正（言語名のみに）
					if (lang && codeElement.properties.className) {
						if (
							typeof codeElement.properties.className === 'object' &&
							Array.isArray(codeElement.properties.className)
						) {
							// 既存のlanguage-xxxクラスを削除
							codeElement.properties.className =
								codeElement.properties.className.filter(
									(cls: any) =>
										typeof cls !== 'string' || !cls.startsWith('language-'),
								);
							// 正しい言語名のクラスを追加
							codeElement.properties.className.push(`language-${lang}`);
						}
					}

					// pre要素に保存
					if (lang) {
						// eslint-disable-next-line no-param-reassign
						node.properties = node.properties || {};
						// eslint-disable-next-line no-param-reassign
						node.properties['data-lang'] = lang;
						if (filename) {
							// eslint-disable-next-line no-param-reassign
							node.properties['data-meta'] = filename;
						}
						// data-diff-mode属性も転送
						if (diffMode) {
							// eslint-disable-next-line no-param-reassign
							node.properties['data-diff-mode'] = diffMode;
						}
					}
				}
			}
		});
	};
};

// rehypeShikiの処理前に言語情報を一時保存し、処理後に復元するプラグイン
// rehypeShikiがpre要素を完全に置き換えるため、言語情報を一時的に保存する必要がある
const langInfoArray: Array<{
	lang: string;
	filename: string | null;
	diffMode: string | null;
}> = [];

// rehypeShikiの処理前に言語情報を一時保存（順序を保持）
export const saveCodeBlockLangPlugin = () => {
	return (tree: Node) => {
		langInfoArray.length = 0; // 配列をクリア
		visit(tree, 'element', (node: Element) => {
			if (node.tagName === 'pre' && node.properties) {
				// rehypeShikiが処理する可能性のあるpre要素かどうかを判定
				// （code要素があり、language-xxxクラスがある場合）
				const codeElement = node.children?.find(
					(child: any) => child.type === 'element' && child.tagName === 'code',
				) as Element | undefined;

				const willBeProcessedByShiki =
					codeElement &&
					codeElement.properties?.className &&
					typeof codeElement.properties.className === 'object' &&
					Array.isArray(codeElement.properties.className) &&
					codeElement.properties.className.some(
						(cls: any) =>
							typeof cls === 'string' && cls.startsWith('language-'),
					);

				// rehypeShikiが処理する可能性のあるpre要素のみを保存
				if (willBeProcessedByShiki && node.properties['data-lang']) {
					const lang = String(node.properties['data-lang']);
					const filename = node.properties['data-meta']
						? String(node.properties['data-meta'])
						: null;
					const diffMode = node.properties['data-diff-mode']
						? String(node.properties['data-diff-mode'])
						: null;

					langInfoArray.push({ lang, filename, diffMode });
				}
			}
		});
	};
};

// rehypeShikiの処理後に言語情報を復元（順序に基づいて）
export const restoreCodeBlockLangPlugin = () => {
	return (tree: Node) => {
		let index = 0;
		visit(tree, 'element', (node: Element) => {
			// rehypeShikiが処理した後の<pre class="shiki">を検出
			if (
				node.tagName === 'pre' &&
				node.properties &&
				typeof node.properties.className === 'object' &&
				Array.isArray(node.properties.className) &&
				node.properties.className.includes('shiki')
			) {
				// data-lang属性がない場合、復元を試みる
				if (!node.properties['data-lang']) {
					const savedInfo = langInfoArray[index];
					if (savedInfo) {
						// eslint-disable-next-line no-param-reassign
						node.properties['data-lang'] = savedInfo.lang;
						if (savedInfo.filename) {
							// eslint-disable-next-line no-param-reassign
							node.properties['data-meta'] = savedInfo.filename;
						}
						if (savedInfo.diffMode) {
							// eslint-disable-next-line no-param-reassign
							node.properties['data-diff-mode'] = savedInfo.diffMode;
						}
					}
					index += 1;
				} else {
					// data-langが既に存在する場合も、data-diff-modeを復元する
					const savedInfo = langInfoArray[index];
					if (
						savedInfo &&
						savedInfo.diffMode &&
						!node.properties['data-diff-mode']
					) {
						// eslint-disable-next-line no-param-reassign
						node.properties['data-diff-mode'] = savedInfo.diffMode;
					}
					// インデックスを進める
					index += 1;
				}
			}
		});
	};
};

// diff形式のコードブロックで-/+で始まる行にクラスを追加するrehypeプラグイン
export const addDiffLineClassesPlugin = () => {
	return (tree: Node) => {
		visit(tree, 'element', (node: Element) => {
			// shiki処理後の<pre class="shiki">要素を検出
			if (
				node.tagName === 'pre' &&
				node.properties &&
				typeof node.properties.className === 'object' &&
				Array.isArray(node.properties.className) &&
				node.properties.className.includes('shiki') &&
				node.properties['data-diff-mode']
			) {
				const diffMode = String(node.properties['data-diff-mode']);
				if (diffMode !== 'with-bg' && diffMode !== 'text-only') {
					return;
				}

				// code要素を検索
				const codeElement = node.children?.find(
					(child: any) => child.type === 'element' && child.tagName === 'code',
				) as Element | undefined;

				if (!codeElement || !codeElement.children) {
					return;
				}

				// 各行（span.line）を走査
				codeElement.children.forEach((lineNode: any) => {
					if (
						lineNode.type === 'element' &&
						lineNode.tagName === 'span' &&
						lineNode.properties &&
						typeof lineNode.properties.className === 'object' &&
						Array.isArray(lineNode.properties.className) &&
						lineNode.properties.className.includes('line')
					) {
						// 行の最初の非空白文字を取得
						// 行の最初の子要素（spanまたはテキストノード）から取得
						const getFirstChar = (element: any): string | null => {
							// テキストノードの場合
							if (element.type === 'text') {
								const text = element.value?.trimStart();
								return text?.[0] || null;
							}
							// 要素の場合、最初の子要素を再帰的に確認
							if (
								element.type === 'element' &&
								element.children &&
								element.children.length > 0
							) {
								// 最初の子要素から順に確認
								for (const child of element.children) {
									const char = getFirstChar(child);
									if (char) {
										return char;
									}
								}
							}
							return null;
						};

						// 行の最初の非空白文字を取得
						const firstChild = lineNode.children?.[0];
						const firstChar = firstChild ? getFirstChar(firstChild) : null;

						// -/+で始まる行にクラスを追加
						if (firstChar === '-' || firstChar === '+') {
							const className = lineNode.properties.className as string[];
							if (diffMode === 'with-bg') {
								if (firstChar === '-') {
									if (!className.includes('diff-line-remove')) {
										className.push('diff-line-remove');
									}
								} else if (firstChar === '+') {
									if (!className.includes('diff-line-add')) {
										className.push('diff-line-add');
									}
								}
							} else if (diffMode === 'text-only') {
								if (firstChar === '-') {
									if (!className.includes('diff-text-remove')) {
										className.push('diff-text-remove');
									}
								} else if (firstChar === '+') {
									if (!className.includes('diff-text-add')) {
										className.push('diff-text-add');
									}
								}
							}
						}
					}
				});
			}
		});
	};
};

// コードブロックに言語ラベルを追加するrehypeプラグイン
export const addCodeBlockLabelPlugin = () => {
	return (tree: Node) => {
		visit(
			tree,
			'element',
			(node: Element, index: number | undefined, parent?: Parent) => {
				// <pre>要素を検出（Shikiが処理した場合も、処理されていない場合も対応）
				if (
					node.tagName === 'pre' &&
					node.properties &&
					parent &&
					typeof index === 'number'
				) {
					// 言語とファイル名を取得
					let lang: string | null = null;
					let filename: string | null = null;

					// コードブロックかどうかを判定（<code>要素があるか、Shikiが処理したか）
					const hasCodeElement =
						node.children &&
						Array.isArray(node.children) &&
						node.children.some(
							(child: any) =>
								child.type === 'element' && child.tagName === 'code',
						);
					const isShiki =
						typeof node.properties.className === 'object' &&
						Array.isArray(node.properties.className) &&
						node.properties.className.includes('shiki');

					// コードブロックの場合のみ処理
					if (hasCodeElement || isShiki) {
						// まずpre要素のdata属性から取得（preserveCodeBlockLangPluginで保存された情報、優先）
						if (node.properties) {
							if (node.properties['data-lang']) {
								const langValue = String(node.properties['data-lang']);
								// `:`が含まれている場合、言語とファイル名を分離
								if (langValue.includes(':')) {
									const parts = langValue.split(':');
									const [firstPart, ...restParts] = parts;
									lang = firstPart;
									filename = restParts.join(':');
								} else {
									lang = langValue;
								}
							}
							if (node.properties['data-meta']) {
								filename = String(node.properties['data-meta']);
							}
						}

						// 言語が取得できない場合、<code>要素から取得
						if (!lang && node.children && Array.isArray(node.children)) {
							const codeElement = node.children.find(
								(child: any) =>
									child.type === 'element' && child.tagName === 'code',
							) as Element | undefined;

							if (codeElement && codeElement.properties) {
								// data属性から取得
								if (codeElement.properties['data-lang']) {
									const langValue = String(codeElement.properties['data-lang']);
									if (langValue.includes(':')) {
										const parts = langValue.split(':');
										const [firstPart, ...restParts] = parts;
										lang = firstPart;
										if (!filename) {
											filename = restParts.join(':');
										}
									} else {
										lang = langValue;
									}
								} else if (
									codeElement.properties.className &&
									typeof codeElement.properties.className === 'object' &&
									Array.isArray(codeElement.properties.className)
								) {
									// クラス名から言語を抽出（rehypeShikiが処理した後は通常クラス名は残らない）
									const langClass = codeElement.properties.className.find(
										(cls: any) =>
											typeof cls === 'string' && cls.startsWith('language-'),
									);
									if (langClass) {
										const langValue = String(langClass).replace(
											'language-',
											'',
										);
										if (langValue.includes(':')) {
											const parts = langValue.split(':');
											const [firstPart, ...restParts] = parts;
											lang = firstPart;
											if (!filename) {
												filename = restParts.join(':');
											}
										} else {
											lang = langValue;
										}
									}
								}

								// ファイル名を取得
								if (!filename && codeElement.properties['data-meta']) {
									filename = String(codeElement.properties['data-meta']);
								}
							}
						}

						// 言語が存在する場合のみラベルを追加（textの場合は表示しない）
						if (lang && lang !== 'text') {
							// diffで始まる言語指定の特別処理
							let labelText: string | null = null;
							let shouldShowLabel = true;

							// パターン1: diffのみ → ラベル非表示
							if (lang === 'diff') {
								shouldShowLabel = false;
							}
							// パターン2: diff:xxx → ラベル: xxx
							else if (lang.startsWith('diff:')) {
								const afterDiff = lang.substring(5); // 'diff:'を除く
								if (afterDiff) {
									labelText = afterDiff;
								} else {
									shouldShowLabel = false;
								}
							}
							// パターン3: 言語:diff → ラベル非表示（filenameがdiffの場合）
							else if (filename === 'diff') {
								shouldShowLabel = false;
							}
							// パターン4: 言語:diff_xxx → ラベル: xxx（langに:diff_が含まれる場合）
							else if (lang.includes(':diff_')) {
								const diffIndex = lang.indexOf(':diff_');
								const afterDiff = lang.substring(diffIndex + 6); // ':diff_'を除く
								if (afterDiff) {
									labelText = afterDiff;
								} else {
									shouldShowLabel = false;
								}
							}
							// パターン5: 言語:diff_xxx → ラベル: xxx（filenameがdiff_で始まる場合）
							else if (filename && filename.startsWith('diff_')) {
								labelText = filename.substring(5); // 'diff_'を除く
							}
							// パターン6: それ以外（通常の言語指定） → 通常通り
							else {
								labelText = filename || lang;
							}

							// 折り返しボタンを作成
							const wrapButton: Element = {
								type: 'element',
								tagName: 'button',
								properties: {
									className: ['code-block-wrap-button'],
									'aria-label': '折り返し',
									type: 'button',
								},
								children: [
									{
										type: 'element',
										tagName: 'i',
										properties: {
											className: [
												'fa-solid',
												'fa-turn-down',
												'wrap-icon',
												'wrap-icon-scroll',
											],
										},
										children: [],
									},
									{
										type: 'element',
										tagName: 'i',
										properties: {
											className: [
												'fa-solid',
												'fa-right-long',
												'wrap-icon',
												'wrap-icon-wrapped',
											],
										},
										children: [],
									},
								],
							};

							// コピーボタンを作成
							const copyButton: Element = {
								type: 'element',
								tagName: 'button',
								properties: {
									className: ['code-block-copy-button'],
									'aria-label': 'コードをコピー',
									type: 'button',
								},
								children: [
									{
										type: 'element',
										tagName: 'i',
										properties: {
											className: ['fa', 'copy-icon'],
										},
										children: [
											{
												type: 'text',
												value: '',
											},
										],
									},
									{
										type: 'element',
										tagName: 'span',
										properties: {
											className: ['copy-feedback'],
										},
										children: [
											{
												type: 'text',
												value: 'クリップボードにコピーしました！',
											},
										],
									},
								],
							};

							// ラベルを表示する場合のみラベル要素を作成
							if (shouldShowLabel && labelText) {
								const label: Element = {
									type: 'element',
									tagName: 'div',
									properties: { className: ['code-block-label'] },
									children: [
										{
											type: 'text',
											value: labelText,
										},
									],
								};

								// ラッパーdivを作成（折り返しボタンとコピーボタンを含む）
								const wrapper: Element = {
									type: 'element',
									tagName: 'div',
									properties: { className: ['code-block-wrapper'] },
									children: [wrapButton, copyButton, label, node],
								};

								// eslint-disable-next-line no-param-reassign
								parent.children[index] = wrapper;
							} else {
								// ラベル非表示の場合はラッパーのみ作成（折り返しボタンとコピーボタンを含む）
								const wrapper: Element = {
									type: 'element',
									tagName: 'div',
									properties: { className: ['code-block-wrapper'] },
									children: [wrapButton, copyButton, node],
								};

								// eslint-disable-next-line no-param-reassign
								parent.children[index] = wrapper;
							}
						} else if (lang === 'text') {
							// 折り返しボタンを作成
							const wrapButton: Element = {
								type: 'element',
								tagName: 'button',
								properties: {
									className: ['code-block-wrap-button'],
									'aria-label': '折り返し',
									type: 'button',
								},
								children: [
									{
										type: 'element',
										tagName: 'i',
										properties: {
											className: [
												'fa-solid',
												'fa-turn-down',
												'wrap-icon',
												'wrap-icon-scroll',
											],
										},
										children: [],
									},
									{
										type: 'element',
										tagName: 'i',
										properties: {
											className: [
												'fa-solid',
												'fa-right-long',
												'wrap-icon',
												'wrap-icon-wrapped',
											],
										},
										children: [],
									},
								],
							};

							// コピーボタンを作成
							const copyButton: Element = {
								type: 'element',
								tagName: 'button',
								properties: {
									className: ['code-block-copy-button'],
									'aria-label': 'コードをコピー',
									type: 'button',
								},
								children: [
									{
										type: 'element',
										tagName: 'i',
										properties: {
											className: ['fa', 'copy-icon'],
										},
										children: [
											{
												type: 'text',
												value: '',
											},
										],
									},
									{
										type: 'element',
										tagName: 'span',
										properties: {
											className: ['copy-feedback'],
										},
										children: [
											{
												type: 'text',
												value: 'クリップボードにコピーしました！',
											},
										],
									},
								],
							};

							// textの場合はラッパーのみ作成（ラベルなし、折り返しボタンとコピーボタンを含む）
							const wrapper: Element = {
								type: 'element',
								tagName: 'div',
								properties: { className: ['code-block-wrapper'] },
								children: [wrapButton, copyButton, node],
							};

							// eslint-disable-next-line no-param-reassign
							parent.children[index] = wrapper;
						}
					}
				}
			},
		);
	};
};

export const rehypePlugins = async () => [
	preserveCodeBlockLangPlugin as any,
	saveCodeBlockLangPlugin as any,
	[
		rehypeShiki,
		{
			highlighter: await getShikiHighlighter(),
		},
	],
	restoreCodeBlockLangPlugin as any,
	addDiffLineClassesPlugin as any,
	rehypeMathJaxSvg,
	wrapTablePlugin as any,
	addCodeBlockLabelPlugin as any,
];
