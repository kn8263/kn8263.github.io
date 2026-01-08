import React from 'react';

type Props = {
	copyright: string;
};

const Copyright = ({ copyright }: Props) => (
	<div className="text-xs text-gray-700">{copyright}</div>
);

export { Copyright };
