import React from 'react';

import Link from 'next/link';

type Props = {
	menu: {
		label: string;
		path: string;
	}[];
};

const Menu = ({ menu }: Props) => (
	<nav className="my-2 py-1">
		<ul className="list-none p-0 m-0 ">
			{menu.map((item) => (
				<li className="p-0 mx-0 my-2" key={item.path}>
					{item.path.startsWith('/') ? (
						<Link href={item.path} as={`${item.path}/index.html`}>
							{item.label}
						</Link>
					) : (
						<a href={item.path}>{item.label}</a>
					)}
				</li>
			))}
		</ul>
	</nav>
);

export { Menu };
