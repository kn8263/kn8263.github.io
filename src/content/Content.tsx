import React from 'react';

type IContentProps = {
	children: React.ReactNode;
};

const Content = (props: IContentProps) => (
	<div className="markdown-content">{props.children}</div>
);

export { Content };
