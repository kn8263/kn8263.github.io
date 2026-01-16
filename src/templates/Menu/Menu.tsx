type Props = {
	menu: {
		label: string;
		path: string;
	}[];
};

const Menu = ({ menu }: Props) => (
	<nav className="my-2 py-1">
		<ul className="list-none p-0 m-0 ">
			<li className="p-0 mx-0 my-2">
				<a href="/index.html">トップページ</a>
			</li>
			{menu.map((item) => (
				<li className="p-0 mx-0 my-2" key={item.path}>
					{item.path.startsWith('/') ? (
						<a href={`${item.path}/index.html`}>{item.label}</a>
					) : (
						<a href={item.path}>{item.label}</a>
					)}
				</li>
			))}
		</ul>
	</nav>
);

export { Menu };
