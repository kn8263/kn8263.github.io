import { Author } from './Author/Author';
import Contacts from './Contacts/Contacts';
import { Copyright } from './Copyright/Copyright';
import { Menu } from './Menu/Menu';
import { Recents } from './Recents/Recents';
import { Tags } from './Tags/Tags';
import type { PostItems } from '../types/Content';
import { AppConfig } from '../utils/AppConfig';

type SidebarProps = {
	recents: PostItems[];
	tags: string[];
};

const Sidebar = ({ recents, tags }: SidebarProps) => {
	const { title, copyright, contacts } = AppConfig;
	return (
		<div className="relative p-4">
			<a href="/index.html" className="break-all">
				{title}
			</a>
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
