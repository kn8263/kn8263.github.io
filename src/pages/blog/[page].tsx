import React from 'react';

import { GetStaticPaths, GetStaticProps } from 'next';

import { BlogGallery, IBlogGalleryProps } from '../../blog/BlogGallery';
import { Meta } from '../../layout/Meta';
import { IPaginationProps } from '../../pagination/Pagination';
import { Main } from '../../templates/Main';
import { AppConfig } from '../../utils/AppConfig';
import {
	getRecentPosts,
	getCategoryPosts,
	PostItems,
	getTags,
} from '../../utils/Content';
import { convertTo2D } from '../../utils/Pagination';

type IBlogPageUrl = {
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
				title={`ブログ記事一覧 ${props.page}ページ目`}
				description={`ブログ記事一覧 ${props.page}ページ目`}
			/>
		}
	>
		<h1 className="content-title">ブログ記事一覧 {props.page}ページ目</h1>
		<BlogGallery posts={props.posts} pagination={props.pagination} />
	</Main>
);

export const getStaticPaths: GetStaticPaths<IBlogPageUrl> = async () => {
	// const posts = getCategoryPosts('blog', ['slug']);

	// const pages = convertTo2D(posts, AppConfig.pagination_size);

	// const paths = pages.map((_, index) =>
	// 	// index === 0
	// 	//   ? {
	// 	//       params: {
	// 	//         page: '/',
	// 	//       },
	// 	//     }
	// 	//   :
	// 	({
	// 		params: {
	// 			// Ind starts from zero so we need to do ind + 1
	// 			// slice(1) removes the first page so we do another ind + 1
	// 			// the first page is implemented in index.tsx
	// 			page: `${index + 1}`,
	// 		},
	// 	})
	// );

	return {
		paths: [],
		fallback: false,
	};
};

export const getStaticProps: GetStaticProps<
	PaginatePostsProps,
	IBlogPageUrl
> = async ({ params }) => {
	const posts = getCategoryPosts('blog', ['title', 'date', 'slug']);
	const recents = getRecentPosts(['title', 'date', 'slug']);
	const tags = getTags();

	const pages = convertTo2D(posts, AppConfig.pagination_size);
	const currentPage = Number(params!.page.replace('page', ''));
	const currentIndex = currentPage - 1;

	const pagination: IPaginationProps = {};

	if (currentPage < pages.length) {
		pagination.next = `/blog/${currentPage + 1}`;
	}

	if (currentPage > 1) {
		pagination.previous = `/blog/${currentPage - 1}`;
	}

	return {
		props: {
			page: currentPage,
			posts: pages[currentIndex],
			pagination,
			recents,
			tags,
		},
	};
};

export default PaginatePosts;
