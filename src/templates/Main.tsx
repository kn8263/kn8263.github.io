import { ReactNode } from 'react';

import Link from 'next/link';

import { CheckMeRibbon } from './CheckMeRibbon';
import { Sidebar } from './SideBar';
import { Navbar } from '../navigation/Navbar';
import { AppConfig } from '../utils/AppConfig';
import { PostItems } from '../utils/Content';

type IMainProps = {
	recents: PostItems[];
	tags: string[];
	meta: ReactNode;
	children: ReactNode;
};

const Main = (props: IMainProps) => (
	<div className="antialiased w-full text-black md:px-0 sm:flex min-h-screen">
		{props.meta}

		<div className="mx-auto float-left px-3 w-full sm:w-3/4 lg:w-[calc(100vw-256px)] bg-slate-100 min-h-fit sm:min-h-screen">
			<div className="border-b border-gray-300 break-all text-center text-zinc-900 font-semibold block">
				<div className="pt-4 pb-8 sm:pb-0">
					<div className="font-semibold text-2xl text-gray-900">
						<Link href="/" as="/index.html">
							{AppConfig.title}
						</Link>
					</div>
					<div className="text-sm sm:hidden">{AppConfig.description}</div>
				</div>
				<div className="sm:hidden">
					<Navbar>
						<li className="mr-5">
							<Link href="/" as="/index.html">
								Home
							</Link>
						</li>
						<li className="mr-5">
							<Link href="/about" as="/about/index.html">
								About
							</Link>
						</li>
						<li className="mr-5">
							<Link href="/portfolio" as="/portfolio/index.html">
								Portfolio
							</Link>
						</li>
						<li className="mr-5">
							<Link href="/contact" as="/contact/index.html">
								Contact
							</Link>
						</li>
						{/* <li className="mr-6">
							<Link href="/blog/1/" as="/blog/1/index.html">Blog</Link>
						</li> */}
					</Navbar>
				</div>
			</div>

			<div className="text-base py-5">{props.children}</div>
		</div>
		<div className="w-full sm:w-1/4 lg:w-[256px] float-right sticky shadow-md sm:h-full sm:top-auto sm:self-end sm:bottom-0 min-h-fit sm:min-h-screen">
			<CheckMeRibbon />
			<Sidebar recents={props.recents} tags={props.tags} />
		</div>
	</div>
);

export { Main };
