import React from 'react';

import { GetStaticProps } from 'next';

import { Content } from '../content/Content';
import { Meta } from '../layout/Meta';
import { Main } from '../templates/Main';
import { getRecentPosts, getTags, PostItems } from '../utils/Content';

type AboutProps = {
	recents: PostItems[];
	tags: string[];
};

const About = (props: AboutProps) => (
	<Main
		recents={props.recents}
		tags={props.tags}
		meta={<Meta title="404 not found" description="404 not found page" />}
	>
		<Content>
			<h1 className="content-title">404 not found</h1>
		</Content>
	</Main>
);

export const getStaticProps: GetStaticProps<AboutProps> = async () => ({
	props: {
		recents: getRecentPosts(['title', 'date', 'slug']),
		tags: getTags(),
	},
});

export default About;
