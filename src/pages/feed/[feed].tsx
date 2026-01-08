import { generateRssFeed } from '../../utils/generateRssFeed';

export const getStaticPaths = async () => {
	await generateRssFeed();
	return {
		paths: [],
		fallback: false,
	};
};

export async function getStaticProps() {
	return { props: {} };
}

const Feed = () => <></>;
export default Feed;
