import { GetStaticProps } from 'next';

import { Content } from '../content/Content';
import { Meta } from '../layout/Meta';
import { Main } from '../templates/Main';
import { getRecentPosts, getTags, PostItems } from '../utils/Content';
import { markdownToHtml } from '../utils/Markdown';

const contentMarkdown = String.raw`
### 自分について

- 中島 功人
- 男
- システムエンジニア(ほぼWeb系)
- 1993年(平成5年)2月15日生まれ (Perfumeあ～ちゃんと同じ日！)


### 連絡先

- email: [kn8263@gmail.com](mailto:kn8263@gmail.com)
- github: [kn8263](https://github.com/kn8263)


### 最終学歴

- キクチ眼鏡専門学校 眼鏡光学科卒業

### 実務経験のある主なプログラミング言語

- PHP
- TypeScript・JavaScript
- Python
- Ruby
- Rust（Windowsネイティブ向けアプリのみ）


### 実務経験のあるライブラリ・フレームワーク

- Laravel
- FastAPI
- Ruby on Rails
- React
- Vue.js
- Nuxt.js
- Express.js
- Solid.js
- Astro.js
- Tauri
- tailwindcss

### その他実務経験のある技術

- Docker
- Node.js
- Terraform
- AWS  
  Amazon EC2  
  Amazon DynamoDB  
  Amazon S3  
  Amazon SES  
  Amazon SQS  
  Amazon Route 53  
  Amazon CloudFront  
  Amazon Rekognition  
  Amazon EventBridge  
  AWS Lambda  

### 趣味

- Perfume推し活
- 筋トレ  
  BIG3 675kg (ベンチプレス: 175kg・スクワット: 220kg・デッドリフト: 280kg)
- 旅行
- キャンプ・ハイキング

### 好きなアニメ・映画など

- ちはやふる
- Rudy (ルディ涙のウイニングラン)

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
		meta={<Meta title="ポートフォリオ" description="ポートフォリオ" />}
	>
		<h1 className="content-title">ポートフォリオ</h1>
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
