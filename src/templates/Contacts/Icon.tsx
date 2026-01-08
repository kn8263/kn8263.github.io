import React from 'react';

type Props = {
	name: string;
	icon: {
		viewBox?: string;
		path?: string;
	};
};

const Icon = ({ name, icon }: Props) => (
	<svg
		className="inline-block w-4 h-4 stroke-0 stroke-current fill-current not-italic font-normal mx-[0.2em] text-center normal-nums normal-case text-xs antialiased"
		viewBox={icon.viewBox}
	>
		<title>{name}</title>
		<path d={icon.path} />
	</svg>
);

export default Icon;
