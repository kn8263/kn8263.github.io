import React from 'react';

import { format } from 'date-fns';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';

import { Content } from '../../content/Content';
import { Meta } from '../../layout/Meta';
import { PostPagination } from '../../pagination/PostPagination';
import { Main } from '../../templates/Main';
import {
	getAllPostsIncludeTSX,
	getMdPosts,
	getPostBySlug,
	getRecentPosts,
	getTags,
	PostItems,
} from '../../utils/Content';
import { markdownToHtml } from '../../utils/Markdown';

type IPostUrl = {
	slug: string;
};

type IPostProps = {
	title: string;
	description: string;
	date: string;
	modified_date?: string | null;
	image?: string | null;
	content: string;
	tags?: string[] | null;
	recents: PostItems[];
	prevPost?: PostItems;
	nextPost?: PostItems;
	mainTags: string[];
};

const DisplayPost = (props: IPostProps) => (
	<Main
		recents={props.recents}
		tags={props.mainTags}
		meta={
			<Meta
				title={props.title}
				description={props.description}
				post={{
					image: props.image,
					date: props.date,
					modified_date: props.modified_date,
				}}
			/>
		}
	>
		<h1 className="content-title">{props.title}</h1>
		<div className="content-date">
			Posted {format(new Date(props.date), 'LLLL d, yyyy')}
		</div>

		<ul className="flex flex-row flex-wrap list-none p-0 m-2 justify-start">
			{props.tags?.map((tag) => (
				<li
					className="px-2 py-1 m-1 rounded-full overflow-hidden shadow-md border-0 bg-white w-fit break-all"
					key={tag}
				>
					<Link
						href={{
							pathname: '/tag/[tag]',
							query: { tag },
						}}
						as={`/tag/${tag}/index.html`}
					>
						#{tag}
					</Link>
				</li>
			))}
		</ul>
		<Content>
			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: props.content }}
			/>
		</Content>

		<PostPagination nextPost={props.nextPost} prevPost={props.prevPost} />
	</Main>
);

export const getStaticPaths: GetStaticPaths<IPostUrl> = async () => {
	const posts = getMdPosts(['slug']);

	return {
		paths: posts.map((post) => ({
			params: {
				slug: post.slug.replace(/^posts\//u, ''),
			},
		})),
		fallback: false,
	};
};

export const getStaticProps: GetStaticProps<IPostProps, IPostUrl> = async ({
	params,
}) => {
	const realSlug = params!.slug;
	const post = getPostBySlug(realSlug, [
		'title',
		'description',
		'date',
		'modified_date',
		'image',
		'content',
		'slug',
		'tags',
	]);
	const content = await markdownToHtml(post.content || '');
	const recents = getRecentPosts(['title', 'date', 'slug']);
	const mainTags = getTags();

	const posts = getAllPostsIncludeTSX(['title', 'date', 'slug']);
	const currentNumber = posts
		.map(({ slug }) => slug)
		.indexOf(`posts/${realSlug}`);

	return {
		props: {
			title: post.title,
			description: post.description,
			date: post.date,
			modified_date: post.modified_date ?? null,
			image: post.image ?? null,
			content,
			recents,
			tags: post.tags ?? null,
			prevPost: posts[currentNumber - 1] ?? null,
			nextPost: posts[currentNumber + 1] ?? null,
			mainTags,
		},
	};
};

export default DisplayPost;
