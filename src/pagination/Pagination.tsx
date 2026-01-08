export type IPaginationProps = {
	previous?: string;
	next?: string;
};

const Pagination = (props: IPaginationProps) => (
	<div className="text-sm flex justify-between">
		{props.previous && (
			<div className="w-1/2">
				<a
					href={
						props.previous === '/' ? '/' : props.previous?.concat('/index.html')
					}
				>
					← 新しいレポート
				</a>
			</div>
		)}

		{props.next && (
			<div className="text-right ml-auto w-1/2">
				<a href={props.next?.concat('/index.html')}>過去のレポート →</a>
			</div>
		)}
	</div>
);

export { Pagination };
