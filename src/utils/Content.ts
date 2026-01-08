// このファイルはサーバーサイドでのみ実行されることを想定しています
// クライアントサイドで使用する場合は、型のみをインポートしてください
import fs from 'fs';
import { join } from 'path';

import matter from 'gray-matter';

import { AppConfig } from './AppConfig';
import type { PostItems } from '../types/Content';

// PostItems型を再エクスポート（後方互換性のため）
export type { PostItems } from '../types/Content';

const postsDirectory = join(process.cwd(), '_posts');
const pagesPostsDirectory = join(process.cwd(), 'src', 'pages', 'articles');

export function getPostSlugs() {
	const postsFiles = fs.existsSync(postsDirectory)
		? fs.readdirSync(postsDirectory)
		: [];
	const articlesFiles = fs.existsSync(pagesPostsDirectory)
		? fs.readdirSync(pagesPostsDirectory)
		: [];

	return [...postsFiles, ...articlesFiles].filter((path) => {
		// .md, .tsx, .astroファイルのみを処理
		if (!/\.(md|tsx|astro)$/.test(path)) {
			return false;
		}
		// [slug].astroなどの動的ルートファイルは除外
		if (path.startsWith('[') || path.startsWith('_')) {
			return false;
		}

		const fullPath = join(
			/.*\.md$/.test(path) ? postsDirectory : pagesPostsDirectory,
			path,
		);
		const fileContents = fs.readFileSync(fullPath, 'utf8');

		// .astroファイルの場合は、TypeScriptコードから変数を抽出
		// .tsxファイルの場合は、コメント形式のフロントマターを処理
		let data: any = {};

		if (path.endsWith('.astro')) {
			// .astroファイルの場合、フロントマター部分（最初の---から次の---まで）を抽出
			const frontmatterMatch = fileContents.match(/^---\s*\n([\s\S]*?)\n---/);
			if (frontmatterMatch) {
				const frontmatterCode = frontmatterMatch[1];
				// TypeScriptコードから変数を抽出（簡易的な方法）
				const titleMatch = frontmatterCode.match(
					/const\s+title\s*=\s*["']([^"']+)["']/,
				);
				const dateMatch = frontmatterCode.match(
					/const\s+date\s*=\s*["']([^"']+)["']/,
				);
				const descMatch = frontmatterCode.match(
					/const\s+description\s*=\s*["']([^"']+)["']/,
				);
				const tagsMatch = frontmatterCode.match(
					/const\s+tags\s*=\s*\[([^\]]+)\]/,
				);
				const categoryMatch = frontmatterCode.match(
					/const\s+category\s*=\s*["']([^"']+)["']/,
				);

				data = {
					title: titleMatch ? titleMatch[1] : '',
					date: dateMatch ? dateMatch[1] : '',
					description: descMatch ? descMatch[1] : '',
					tags: tagsMatch
						? tagsMatch[1]
								.split(',')
								.map((t: string) => t.trim().replace(/["']/g, ''))
						: [],
					category: categoryMatch ? categoryMatch[1] : 'blog',
				};
			}
		} else if (path.endsWith('.tsx')) {
			const frontmatterContent = fileContents.replace(/\/\*\*\r?\n/u, '');
			const parsed = matter(frontmatterContent);
			data = parsed.data;
		} else {
			const parsed = matter(fileContents);
			data = parsed.data;
		}
		// Astro環境でも動作するように、import.meta.envも確認
		const isProduction =
			process.env.NODE_ENV === 'production' ||
			(typeof import.meta !== 'undefined' && import.meta.env?.PROD);
		return Boolean(data.date) && (!isProduction || !data?.draft);
	});
}

export function getPostBySlug(slug: string, fields: string[] = []) {
	let realSlug;
	let fileContents;
	let filePath;

	// .mdファイルを優先して検索
	if (fs.existsSync(join(postsDirectory, `${slug}.md`))) {
		filePath = join(postsDirectory, `${slug}.md`);
		fileContents = fs.readFileSync(filePath, 'utf8');
		realSlug = `posts/${slug.replace(/(\.md|\.tsx|\.astro)$/, '')}`;
	} else if (fs.existsSync(join(pagesPostsDirectory, `${slug}.astro`))) {
		// .astroファイルを検索
		filePath = join(pagesPostsDirectory, `${slug}.astro`);
		fileContents = fs.readFileSync(filePath, 'utf8');
		realSlug = `articles/${slug.replace(/(\.md|\.tsx|\.astro)$/, '')}`;
	} else if (fs.existsSync(join(pagesPostsDirectory, `${slug}.tsx`))) {
		// .tsxファイルを検索
		filePath = join(pagesPostsDirectory, `${slug}.tsx`);
		fileContents = fs.readFileSync(filePath, 'utf8');
		realSlug = `articles/${slug.replace(/(\.md|\.tsx|\.astro)$/, '')}`;
	} else {
		throw new Error(`Post not found: ${slug}`);
	}

	// .tsxファイルの場合は、コメント形式のフロントマターを処理
	let frontmatterContent = fileContents;
	if (filePath.endsWith('.tsx')) {
		frontmatterContent = fileContents.replace(/\/\*\*\r?\n/u, '');
	}

	const { data, content } = matter(frontmatterContent);
	const items: PostItems = {
		slug: realSlug,
		date: data.date,
		title: data.title,
		description: data.description,
		content,
		tags: data.tags ?? null,
		category: data.category ?? null,
	};

	// Ensure only the minimal needed data is exposed
	fields.forEach((field) => {
		if (
			field === 'socialImage' ||
			field === 'draft' ||
			field === 'template' ||
			field === 'tags' ||
			field === 'image'
		) {
			items[field] = data[field];
		}
	});

	return items;
}

function getPostByPath(path: string, fields: string[] = []): PostItems {
	const realSlug = /.*\.md$/.test(path)
		? `posts/${path.replace(/(\.md|\.tsx|\.astro)$/, '')}`
		: `articles/${path.replace(/(\.md|\.tsx|\.astro)$/, '')}`;
	const fullPath = join(
		/.*\.md$/.test(path) ? postsDirectory : pagesPostsDirectory,
		path,
	);
	const fileContents = fs.readFileSync(fullPath, 'utf8');

	// .astroファイルの場合は、TypeScriptコードから変数を抽出
	// .tsxファイルの場合は、コメント形式のフロントマターを処理
	let data: any = {};
	let content = '';

	if (path.endsWith('.astro')) {
		// .astroファイルの場合、フロントマター部分（最初の---から次の---まで）を抽出
		const frontmatterMatch = fileContents.match(/^---\s*\n([\s\S]*?)\n---/);
		if (frontmatterMatch) {
			const frontmatterCode = frontmatterMatch[1];
			// TypeScriptコードから変数を抽出（簡易的な方法）
			// title, date, description, tags, categoryを抽出
			const titleMatch = frontmatterCode.match(
				/const\s+title\s*=\s*["']([^"']+)["']/,
			);
			const dateMatch = frontmatterCode.match(
				/const\s+date\s*=\s*["']([^"']+)["']/,
			);
			const descMatch = frontmatterCode.match(
				/const\s+description\s*=\s*["']([^"']+)["']/,
			);
			const tagsMatch = frontmatterCode.match(
				/const\s+tags\s*=\s*\[([^\]]+)\]/,
			);
			const categoryMatch = frontmatterCode.match(
				/const\s+category\s*=\s*["']([^"']+)["']/,
			);

			data = {
				title: titleMatch ? titleMatch[1] : '',
				date: dateMatch ? dateMatch[1] : '',
				description: descMatch ? descMatch[1] : '',
				tags: tagsMatch
					? tagsMatch[1]
							.split(',')
							.map((t: string) => t.trim().replace(/["']/g, ''))
					: [],
				category: categoryMatch ? categoryMatch[1] : 'blog',
			};
		}
		content = fileContents.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
	} else if (path.endsWith('.tsx')) {
		const frontmatterContent = fileContents.replace(/\/\*\*\r?\n/u, '');
		const parsed = matter(frontmatterContent);
		data = parsed.data;
		content = parsed.content;
	} else {
		const parsed = matter(fileContents);
		data = parsed.data;
		content = parsed.content;
	}

	const items: PostItems = {
		slug: realSlug,
		date: data.date,
		draft: data.draft ?? null,
		title: data.title,
		description: data.description,
		content,
		tags: data.tags ?? null,
		category: data.category ?? null,
		type: path.endsWith('.astro')
			? 'astro'
			: path.endsWith('.tsx')
				? 'tsx'
				: undefined,
	};

	// Ensure only the minimal needed data is exposed
	fields.forEach((field) => {
		if (field === 'type') {
			// typeはファイルパスから直接設定するため、dataからは取得しない
			// 既に設定されているので何もしない
		} else if (
			field === 'socialImage' ||
			field === 'draft' ||
			field === 'template' ||
			field === 'tags' ||
			field === 'image'
		) {
			items[field] = data[field] ?? null;
		}
	});

	return items;
}

export function getMdPosts(fields: string[] = []) {
	const slugs = getPostSlugs();
	const posts = slugs
		.map((path) => getPostByPath(path, ['type', ...fields]))
		.filter((post) => {
			// .mdファイルのみを返す（.astroや.tsxファイルは除外）
			return !post.type;
		})
		// sort posts by date in descending order
		.sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
	return posts;
}

export function getAllPostsIncludeTSX(fields: string[] = []) {
	const slugs = getPostSlugs();
	const posts = slugs
		.map((path) => getPostByPath(path, fields))
		// sort posts by date in descending order
		.sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
	return posts;
}

export function getPrevNextPost(filename: string) {
	const posts = getAllPostsIncludeTSX(['title', 'date', 'slug']);
	const slug =
		filename
			.match(/(articles[/\\][^/\\]*)\.[tj]sx?$/)?.[1]
			.replace('\\', '/') ?? '';
	const currentNumber = posts.map((post) => post.slug).indexOf(slug);
	if (currentNumber === -1) {
		return {};
	}
	return {
		prevPost: posts[currentNumber - 1] ?? null,
		nextPost: posts[currentNumber + 1] ?? null,
	};
}

export function getRecentPosts(fields: string[] = []) {
	const slugs = getPostSlugs();
	const posts = slugs
		.map((path) => getPostByPath(path, fields))
		// sort posts by date in descending order
		.sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
		.slice(0, AppConfig.pagination_size);
	return posts;
}

export function getCategoryPosts(category: string, fields: string[] = []) {
	const slugs = getPostSlugs();
	const posts = slugs
		.map((path) => getPostByPath(path, fields))
		.filter((post) => {
			return post.category === category && !post.draft;
		})
		// sort posts by date in descending order
		.sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
	return posts;
}

export function getTags() {
	const slugs = getPostSlugs();
	const posts = slugs
		.map((path) => getPostByPath(path, ['tags']))
		.filter((post) => {
			return !post.draft;
		});
	return posts
		.filter((post) => Number(post.tags?.length) > 0)
		.flatMap((post) => post.tags!);
}
