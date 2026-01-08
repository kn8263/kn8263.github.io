import Link from 'next/link';

import { Author } from './Author/Author';
import Contacts from './Contacts/Contacts';
import { Copyright } from './Copyright/Copyright';
import { Menu } from './Menu/Menu';
import { Recents } from './Recents/Recents';
import { Tags } from './Tags/Tags';
import { AppConfig } from '../utils/AppConfig';
import { PostItems } from '../utils/Content';

type SidebarProps = {
	recents: PostItems[];
	tags: string[];
};

const Sidebar = ({ recents, tags }: SidebarProps) => {
	const { title, copyright, contacts } = AppConfig;
	return (
		<div className="relative p-4">
			<Link href="/" className="break-all">
				{title}
			</Link>
			<Author />
			<Menu menu={AppConfig.sidebar_links} />
			<Recents posts={recents} />
			<Tags tags={tags} />
			<Contacts contacts={contacts} />
			<Copyright copyright={copyright} />
		</div>
	);
};

export { Sidebar };
