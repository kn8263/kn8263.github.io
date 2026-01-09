import rehypeShiki from '@leafac/rehype-shiki';
import rehypeMathJaxSvg from 'rehype-mathjax/svg';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import {
	remarkPlugins,
	transformImagePaths,
	getShikiHighlighter,
	wrapTablePlugin,
} from './markdown-plugins';

export const markdownToHtml = async (
	markdown: string,
	articleSlug?: string,
) => {
	const processor = unified().use(remarkParse);

	// remarkプラグインを追加
	for (const plugin of remarkPlugins) {
		if (Array.isArray(plugin)) {
			processor.use(plugin[0] as any, plugin[1]);
		} else {
			processor.use(plugin as any);
		}
	}

	// スラッグが指定されている場合、画像パス変換プラグインを追加
	if (articleSlug) {
		processor.use(transformImagePaths(articleSlug) as any);
	}

	return (
		await processor
			.use(remarkRehype, { allowDangerousHtml: true, footnoteLabel: '脚注' })
			.use(rehypeShiki as any, {
				highlighter: await getShikiHighlighter(),
			})
			.use(rehypeMathJaxSvg)
			.use(wrapTablePlugin as any)
			.use(rehypeStringify, { allowDangerousHtml: true })
			.process(markdown)
	)
		.toString()
		.replace(/@@baseUrl@@/g, process.env.baseUrl || '');
};
