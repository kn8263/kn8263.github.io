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
import { unified, Plugin } from 'unified';
import type { Node, Parent } from 'unist';
import { visit } from 'unist-util-visit';

const addDivMermaidPlugin: Plugin = () => {
	return (tree: Node, _file) => {
		visit(
			tree,
			(node) =>
				node.type === 'code' && 'lang' in node && node.lang === 'mermaid',
			(node, index, parent?: Parent) => {
				if (parent && index) {
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

export const markdownToHtml = async (markdown: string) =>
	(
		await unified()
			.use(remarkParse)
			.use(remarkMath)
			.use(remarkGfm)
			.use(remarkPlantUML as any)
			.use(addDivMermaidPlugin)
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
