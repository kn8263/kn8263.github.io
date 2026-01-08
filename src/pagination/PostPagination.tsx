import type { PostItems } from '../types/Content';

export type IPaginationProps = {
	prevPost?: PostItems;
	nextPost?: PostItems;
};

const PostPagination = (props: IPaginationProps) => (
	<div className="text-sm flex justify-between">
		{props.prevPost && (
			<div className="w-1/2">
				← 新しいレポート
				<br />
				<a href={`/${props.prevPost.slug}/index.html`}>
					{props.prevPost.title}
				</a>
			</div>
		)}

		{props.nextPost && (
			<div className="text-right ml-auto w-1/2">
				過去のレポート →
				<br />
				<a href={`/${props.nextPost.slug}/index.html`}>
					{props.nextPost.title}
				</a>
			</div>
		)}
	</div>
);

export { PostPagination };
