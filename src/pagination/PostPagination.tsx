import React from 'react';

import Link from 'next/link';

import { PostItems } from '../utils/Content';

export type IPaginationProps = {
	prevPost?: PostItems;
	nextPost?: PostItems;
};

const PostPagination = (props: IPaginationProps) => (
	<div className="text-sm flex justify-between">
		{props.prevPost && (
			<div className="w-1/2">
				← 新しいレポート
				<br />
				<Link
					href={
						props.prevPost.slug.startsWith('posts/')
							? {
									pathname: '/posts/[slug]',
									query: {
										slug: props.prevPost.slug.replace(/^.*\/([^/]*)$/, '$1'),
									},
								}
							: `/${props.prevPost.slug}`
					}
					as={`/${props.prevPost.slug}/index.html`}
				>
					{props.prevPost.title}
				</Link>
			</div>
		)}

		{props.nextPost && (
			<div className="text-right ml-auto w-1/2">
				過去のレポート →
				<br />
				<Link
					href={
						props.nextPost.slug.startsWith('posts/')
							? {
									pathname: '/posts/[slug]',
									query: {
										slug: props.nextPost.slug.replace(/^.*\/([^/]*)$/, '$1'),
									},
								}
							: `/${props.nextPost.slug}`
					}
					as={`/${props.nextPost.slug}/index.html`}
				>
					{props.nextPost.title}
				</Link>
			</div>
		)}
	</div>
);

export { PostPagination };
