import React from 'react';

type INavbarProps = {
	children: React.ReactNode;
};

const Navbar = (props: INavbarProps) => (
	<ul className="navbar flex flex-wrap text-xl">{props.children}</ul>
);

export { Navbar };
