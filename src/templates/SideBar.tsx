import { Author } from './Author/Author';
import { CheckMeRibbon } from './CheckMeRibbon';
import Contacts from './Contacts/Contacts';
import { Copyright } from './Copyright/Copyright';
import { Menu } from './Menu/Menu';
import { Recents } from './Recents/Recents';
import { Tags } from './Tags/Tags';
import type { PostItems } from '../types/Content';
import { AppConfig } from '../utils/AppConfig';
import './SideBar.css';

type SidebarProps = {
	recents: PostItems[];
	tags: string[];
};

const Sidebar = ({ recents, tags }: SidebarProps) => {
	const { copyright, contacts } = AppConfig;
	return (
		<div className="sidebar-container">
			<CheckMeRibbon />
			<a href="/index.html" className="break-all">
				TOP PAGE
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
