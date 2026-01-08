import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { remarkPlugins, rehypePlugins } from './src/utils/markdown-plugins.ts';
import { rssPlugin } from './scripts/rss-plugin.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://kn8263.github.io',
	base: '/',
	trailingSlash: 'always',
	output: 'static',
	integrations: [
		react(),
		mdx({
			remarkPlugins,
			rehypePlugins: rehypePlugins,
		}),
		tailwind({
			applyBaseStyles: false,
		}),
		// sitemapプラグインは一時的に無効化（エラーが発生しているため）
		// sitemap(),
	],
	vite: {
		plugins: [rssPlugin()],
		ssr: {
			noExternal: ['@mui/material', '@mui/icons-material'],
		},
		optimizeDeps: {
			exclude: ['fs', 'path'],
		},
	},
	build: {
		assets: 'assets',
	},
});
