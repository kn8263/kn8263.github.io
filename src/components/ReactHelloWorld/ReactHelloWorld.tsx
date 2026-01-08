import React from 'react';

type ReactHelloWorldProps = {
	children: React.ReactNode;
};

const ReactHelloWorld = ({ children }: ReactHelloWorldProps) => (
	<div className="p-4 bg-blue-100 rounded border-2 border-blue-300">
		<p className="text-blue-800 font-semibold">{children}</p>
	</div>
);

export default ReactHelloWorld;
