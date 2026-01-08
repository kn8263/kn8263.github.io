import React from 'react';

import getContactHref from './get-contact-href';
import getIcon from './get-icon';
import Icon from './Icon';

type Props = {
	contacts: {
		[key: string]: string;
	};
};

const Contacts = ({ contacts }: Props) => (
	<div className="my-2 py-1 border-t border-[#dedede]">
		<ul className="flex flex-row flex-wrap grow-0 shrink-0 list-none p-0 mx-[-3px] my-2 justify-start">
			{Object.keys(contacts).map((name) =>
				!contacts[name] ? null : (
					<li
						className="h-8 w-8 flex p-0 m-1 items-center content-center justify-center leading-8 rounded-full text-center border border-gray-400"
						key={name}
					>
						<a
							className="border-0 flex text-gray-800 hover:text-gray-600"
							href={getContactHref(name, contacts[name])}
							rel="noopener noreferrer"
							target="_blank"
						>
							<Icon name={name} icon={getIcon(name)} />
						</a>
					</li>
				),
			)}
		</ul>
	</div>
);

export default Contacts;
