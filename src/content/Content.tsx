import React, { ReactNode } from 'react';

type IContentProps = {
	children: ReactNode;
};

const Content = (props: IContentProps) => (
	<div className="markdown-content">{props.children}</div>
);

export { Content };
