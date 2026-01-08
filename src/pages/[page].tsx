import React from 'react';

import { GetStaticPaths, GetStaticProps } from 'next';

import { BlogGallery, IBlogGalleryProps } from '../blog/BlogGallery';
import { Meta } from '../layout/Meta';
import { IPaginationProps } from '../pagination/Pagination';
import { Main } from '../templates/Main';
import { AppConfig } from '../utils/AppConfig';
import {
	getAllPostsIncludeTSX,
	getRecentPosts,
	getTags,
	PostItems,
} from '../utils/Content';
import { convertTo2D } from '../utils/Pagination';

type IPageUrl = {
	page: string;
};

type PaginatePostsProps = IBlogGalleryProps & {
	page: number;
	recents: PostItems[];
	tags: string[];
};

const PaginatePosts = (props: PaginatePostsProps) => (
	<Main
		recents={props.recents}
		tags={props.tags}
		meta={
			<Meta
				title={`レポート一覧 ${props.page}ページ目`}
				description={`レポート一覧 ${props.page}ページ目`}
			/>
		}
	>
		<h1 className="content-title">{`レポート一覧 ${props.page}ページ目`}</h1>
		<BlogGallery posts={props.posts} pagination={props.pagination} />
	</Main>
);

export const getStaticPaths: GetStaticPaths<IPageUrl> = async () => {
	const posts = getAllPostsIncludeTSX(['slug']);

	const pages = convertTo2D(posts, AppConfig.pagination_size);

	return {
		paths: pages.slice(1).map((_, index) => ({
			params: {
				// Ind starts from zero so we need to do ind + 1
				// slice(1) removes the first page so we do another ind + 1
				// the first page is implemented in index.tsx
				page: `page${index + 2}`,
			},
		})),
		fallback: false,
	};
};

export const getStaticProps: GetStaticProps<
	PaginatePostsProps,
	IPageUrl
> = async ({ params }) => {
	const posts = getAllPostsIncludeTSX(['title', 'date', 'slug']);
	const recents = getRecentPosts(['title', 'date', 'slug']);

	const pages = convertTo2D(posts, AppConfig.pagination_size);
	const currentPage = Number(params!.page.replace('page', ''));
	const currentIndex = currentPage - 1;

	const pagination: IPaginationProps = {};

	if (currentPage < pages.length) {
		pagination.next = `page${currentPage + 1}`;
	}

	if (currentPage === 2) {
		pagination.previous = '/';
	} else {
		pagination.previous = `page${currentPage - 1}`;
	}

	return {
		props: {
			page: currentPage,
			posts: pages[currentIndex],
			pagination,
			recents,
			tags: getTags(),
		},
	};
};

export default PaginatePosts;
