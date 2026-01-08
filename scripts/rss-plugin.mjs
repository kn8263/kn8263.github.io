import { generateRssFeed } from '../src/utils/generateRssFeed.ts';

export function rssPlugin() {
	return {
		name: 'rss-plugin',
		buildEnd: async () => {
			await generateRssFeed();
		},
	};
}
