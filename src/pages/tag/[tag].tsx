import React from 'react';

import { GetStaticPaths, GetStaticProps } from 'next';

import { BlogGallery } from '../../blog/BlogGallery';
import { Meta } from '../../layout/Meta';
import { Main } from '../../templates/Main';
import {
	getRecentPosts,
	getCategoryPosts,
	PostItems,
	getTags,
	getAllPostsIncludeTSX,
} from '../../utils/Content';

type IPostUrl = {
	tag: string;
};

type IPostProps = {
	posts: PostItems[];
	recents: PostItems[];
	tags: string[];
	tag: string;
};

const PaginateTags = (props: IPostProps) => (
	<Main
		recents={props.recents}
		tags={props.tags}
		meta={
			<Meta
				title={`＃${props.tag} タグ一覧`}
				description={`＃${props.tag} タグ一覧`}
			/>
		}
	>
		<h1 className="content-title">＃{props.tag} タグ一覧</h1>
		<BlogGallery posts={props.posts} />
	</Main>
);

export const getStaticPaths: GetStaticPaths<IPostUrl> = async () => {
	const posts = getAllPostsIncludeTSX(['tag']);

	return {
		paths: Array.from(
			new Set(
				posts
					.filter((post) => Number(post.tags?.length) > 0)
					.flatMap((post) => post.tags!),
			),
		).map((tag) => ({
			params: {
				tag,
			},
		})),
		fallback: false,
	};
};

export const getStaticProps: GetStaticProps<IPostProps, IPostUrl> = async ({
	params,
}) => {
	const posts = getCategoryPosts('blog', ['title', 'date', 'slug'])
		.filter((post) => Number(post.tags?.length) > 0)
		.filter((post) => post.tags!.includes(params!.tag));
	const recents = getRecentPosts(['title', 'date', 'slug']);
	const tags = getTags();

	return {
		props: {
			posts,
			recents,
			tags,
			tag: params!.tag,
		},
	};
};

export default PaginateTags;
