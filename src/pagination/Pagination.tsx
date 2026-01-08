import React from 'react';

import Link from 'next/link';

export type IPaginationProps = {
	previous?: string;
	next?: string;
};

const Pagination = (props: IPaginationProps) => (
	<div className="text-sm flex justify-between">
		{props.previous && (
			<div className="w-1/2">
				<Link
					href={
						props.previous === '/'
							? '/'
							: {
									pathname: '/page/[slug]',
									query: {
										slug: props.previous.replace(/^.*\/([^/]*)$/, '$1'),
									},
								}
					}
					as={
						props.previous === '/' ? '/' : props.previous?.concat('/index.html')
					}
				>
					← 新しいレポート
				</Link>
			</div>
		)}

		{props.next && (
			<div className="text-right ml-auto w-1/2">
				<Link
					href={{
						pathname: '/page/[slug]',
						query: { slug: props.next.replace(/^.*\/([^/]*)$/, '$1') },
					}}
					as={props.next?.concat('/index.html')}
				>
					過去のレポート →
				</Link>
			</div>
		)}
	</div>
);

export { Pagination };
