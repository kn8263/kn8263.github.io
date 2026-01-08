import fs from 'fs';
import { join } from 'path';

import matter from 'gray-matter';

import { AppConfig } from './AppConfig';

const postsDirectory = join(process.cwd(), '_posts');
const pagesPostsDirectory = join(process.cwd(), 'src', 'pages', 'articles');

export type PostItems = {
	type?: string;
	title: string;
	date: string;
	socialImage?: string;
	image?: string;
	draft?: string;
	template?: string;
	category: string;
	slug: string;
	content: string;
	description: string;
	modified_date?: string;
	tags?: string[];
};

export function getPostSlugs() {
	return [
		...fs.readdirSync(postsDirectory),
		...fs.readdirSync(pagesPostsDirectory),
	].filter((path) => {
		const fullPath = join(
			/.*\.md$/.test(path) ? postsDirectory : pagesPostsDirectory,
			path,
		);
		const fileContents = fs.readFileSync(fullPath, 'utf8');
		const { data } = matter(fileContents.replace(/\/\*\*\r?\n/u, ''));
		return (
			Boolean(data.date) &&
			(process.env.NODE_ENV !== 'production' || !data?.draft)
		);
	});
}

export function getPostBySlug(slug: string, fields: string[] = []) {
	let realSlug;
	let fileContents;
	if (fs.existsSync(join(postsDirectory, `${slug}.md`))) {
		fileContents = fs.readFileSync(join(postsDirectory, `${slug}.md`), 'utf8');
		realSlug = `posts/${slug.replace(/(\.md|\.tsx)$/, '')}`;
	} else {
		fileContents = fs.readFileSync(
			join(pagesPostsDirectory, `${slug}.tsx`),
			'utf8',
		);
		realSlug = `articles/${slug.replace(/(\.md|\.tsx)$/, '')}`;
	}
	const { data, content } = matter(fileContents.replace(/\/\*\*\r\n/u, ''));
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
		? `posts/${path.replace(/(\.md|\.tsx)$/, '')}`
		: `articles/${path.replace(/(\.md|\.tsx)$/, '')}`;
	const fullPath = join(
		/.*\.md$/.test(path) ? postsDirectory : pagesPostsDirectory,
		path,
	);
	const fileContents = fs.readFileSync(fullPath, 'utf8');
	const { data, content } = matter(fileContents.replace(/\/\*\*\r?\n/u, ''));
	const items: PostItems = {
		slug: realSlug,
		date: data.date,
		draft: data.draft ?? null,
		title: data.title,
		description: data.description,
		content,
		tags: data.tags ?? null,
		category: data.category ?? null,
	};

	// Ensure only the minimal needed data is exposed
	fields.forEach((field) => {
		if (
			field === 'type' ||
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
		.filter((path) => {
			return !path.type;
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
