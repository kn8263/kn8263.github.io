import React from 'react';

import { GetStaticProps } from 'next';

import { BlogGallery, IBlogGalleryProps } from '../blog/BlogGallery';
import { Meta } from '../layout/Meta';
import { IPaginationProps } from '../pagination/Pagination';
import { Main } from '../templates/Main';
import { AppConfig } from '../utils/AppConfig';
import {
	getAllPostsIncludeTSX,
	PostItems,
	getRecentPosts,
	getTags,
} from '../utils/Content';

type IndexProps = IBlogGalleryProps & {
	recents: PostItems[];
	tags: string[];
};

const Index = (props: IndexProps) => (
	<Main
		recents={props.recents}
		tags={props.tags}
		meta={<Meta title="KN8263.GITHUB.IO" description={AppConfig.description} />}
	>
		<h1 className="content-title">レポート一覧</h1>
		<BlogGallery posts={props.posts} pagination={props.pagination} />
	</Main>
);

export const getStaticProps: GetStaticProps<IndexProps> = async () => {
	const posts = getAllPostsIncludeTSX(['title', 'date', 'slug']);
	const pagination: IPaginationProps = {};
	const recents = getRecentPosts(['title', 'date', 'slug']);

	if (posts.length > AppConfig.pagination_size) {
		pagination.next = '/page2';
	}

	return {
		props: {
			posts: posts.slice(0, AppConfig.pagination_size),
			pagination,
			recents,
			tags: getTags(),
		},
	};
};

export default Index;
