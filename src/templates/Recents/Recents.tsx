import type { PostItems } from '../../types/Content';

type IRecentPostsProps = {
	posts: PostItems[];
};

const Recents = (props: IRecentPostsProps) => (
	<nav className="my-2 py-1 border-t border-t-slate-200 relative">
		最新のレポート
		<ul className="m-0 p-0 border-0 list-[circle] ml-5">
			{props.posts.map((post) => {
				return (
					<li className="m-0 text-sm" key={post.slug}>
						<a href={`/${post.slug}/index.html`}>{post.title}</a>
					</li>
				);
			})}
		</ul>
	</nav>
);

export { Recents };
