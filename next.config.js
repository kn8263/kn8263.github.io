const withPWA = require('next-pwa')({
	dest: 'public',
});
const withBundleAnalyzer =
	process.env.ANALYZE === 'true'
		? // eslint-disable-next-line import/no-extraneous-dependencies
			require('@next/bundle-analyzer')({ enabled: true })
		: (config) => config;

const baseUrl = '';

module.exports = withBundleAnalyzer(
	withPWA({
		output: 'export',
		poweredByHeader: false,
		trailingSlash: true,
		basePath: baseUrl,
		env: {
			baseUrl,
		},
		// The starter code load resources from `public` folder with `router.basePath` in React components.
		// So, the source code is "basePath-ready".
		// You can remove `basePath` if you don't need it.
		reactStrictMode: true,
	}),
);
