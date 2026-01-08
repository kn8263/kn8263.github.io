import { GetStaticProps } from 'next';

import { Content } from '../content/Content';
import { Meta } from '../layout/Meta';
import { Main } from '../templates/Main';
import { getRecentPosts, getTags, PostItems } from '../utils/Content';
import { markdownToHtml } from '../utils/Markdown';

const contentMarkdown = String.raw`
このウェブサイトは、TypeScript + React + Next.js + Tailwindで作成して、GitHub Pagesで公開しています。
jQueryレス・WordPressレスです。
レスポンシブデザイン・マテリアルデザインを考慮し、パソコンでもスマホでも見やすいように作っています。
また、スタイルはTailwindを使って記述していて、保守や拡張しやすいモダンな設計をしています。
GitHub ActionsでCI/CDをしています。
ソースコードはすべてGitHubに公開していますので見てみて下さい。
<https://github.com/kn8263/kn8263.github.io>

### 著者について

[ポートフォリオ](/portfolio/index.html)
`;

type AboutProps = {
	recents: PostItems[];
	tags: string[];
	contentHTML: string;
};

const About = (props: AboutProps) => (
	<Main
		recents={props.recents}
		tags={props.tags}
		meta={
			<Meta
				title="このウェブサイトについて"
				description="このウェブサイトについて"
			/>
		}
	>
		<h1 className="content-title">このウェブサイトについて</h1>
		<Content>
			<div dangerouslySetInnerHTML={{ __html: props.contentHTML }} />
		</Content>
	</Main>
);

export const getStaticProps: GetStaticProps<AboutProps> = async () => {
	const recents = getRecentPosts(['title', 'date', 'slug']);

	return {
		props: {
			recents,
			tags: getTags(),
			contentHTML: await markdownToHtml(contentMarkdown),
		},
	};
};

export default About;
