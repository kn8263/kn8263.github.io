import fs from 'fs';

import { Feed } from 'feed';

import { AppConfig } from './AppConfig';
import { getAllPostsIncludeTSX } from './Content';
import { markdownToHtml } from './Markdown';

export const generateRssFeed = async () => {
	const baseUrl = AppConfig.url;

	const feed = new Feed({
		title: AppConfig.title,
		description: AppConfig.description,
		id: AppConfig.url,
		link: AppConfig.url,
		language: 'ja',
		copyright: AppConfig.copyright,
		updated: new Date(),
		author: {
			name: AppConfig.author,
		},
		feed: `${baseUrl}/feed`,
	});

	const posts = await getAllPostsIncludeTSX(['title', 'date', 'slug']);

	await Promise.all(
		posts.map(async (post) => {
			const url = `${baseUrl}/${post.slug}`;
			feed.addItem({
				title: post.title,
				description: post.description,
				content: await markdownToHtml(post.content),
				id: url,
				link: url,
				date: new Date(post.date),
			});
		}),
	);
	fs.writeFileSync('./public/rss.xml', feed.rss2());
};
