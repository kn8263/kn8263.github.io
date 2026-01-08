import React from 'react';

import Link from 'next/link';

type ITagPostsProps = {
	tags: string[];
};

const Tags = (props: ITagPostsProps) => (
	<nav className="my-2 py-1 border-t border-t-slate-200 relative">
		タグ
		<ul className="m-0 p-0 border-0 list-[circle] ml-5">
			{Array.from(new Set(props.tags))
				// アルファベット順でソート
				.sort()
				// 投稿数でソート
				// .sort((a, b) => {
				// 	return (
				// 		props.tags.filter((countTag) => countTag === a).length -
				// 		props.tags.filter((countTag) => countTag === b).length
				// 	);
				// })
				.map((tag) => {
					return (
						<li className="m-0 text-sm" key={tag}>
							<Link
								href={{
									pathname: '/tag/[tag]',
									query: { tag },
								}}
								as={`/tag/${tag}/index.html`}
							>
								{tag}({props.tags.filter((countTag) => countTag === tag).length}
								)
							</Link>
						</li>
					);
				})}
		</ul>
	</nav>
);

export { Tags };
