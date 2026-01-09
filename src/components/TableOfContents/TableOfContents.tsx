import { useEffect, useState } from 'react';
import './TableOfContents.css';

type Heading = {
	id: string;
	text: string;
	level: number;
};

type TableOfContentsProps = {
	headings?: Heading[];
};

const TableOfContents = ({
	headings: initialHeadings,
}: TableOfContentsProps) => {
	const [headings, setHeadings] = useState<Heading[]>(initialHeadings || []);
	const [activeId, setActiveId] = useState<string>('');

	// クライアント側で見出しを抽出
	useEffect(() => {
		if (initialHeadings && initialHeadings.length > 0) {
			setHeadings(initialHeadings);
			return undefined;
		}

		// 見出しを自動抽出
		const extractHeadingsFromDOM = (): Heading[] => {
			const headingElements = document.querySelectorAll(
				'.markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6',
			);
			const extracted: Heading[] = [];

			headingElements.forEach((element) => {
				const text = element.textContent?.trim() || '';
				if (text) {
					// IDが既に存在する場合はそれを使用、なければ生成
					let { id } = element;
					if (!id) {
						id = text
							.toLowerCase()
							.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g, '-')
							.replace(/^-+|-+$/g, '');

						// ユニークなIDを生成
						let uniqueId = id;
						let counter = 1;
						while (document.getElementById(uniqueId)) {
							uniqueId = `${id}-${counter}`;
							counter += 1;
						}
						id = uniqueId;
						// eslint-disable-next-line no-param-reassign
						element.id = id;
					}

					const level = parseInt(element.tagName.charAt(1), 10);
					extracted.push({
						id,
						text,
						level,
					});
				}
			});

			return extracted;
		};

		// DOMが読み込まれた後に見出しを抽出
		const timeoutId = setTimeout(() => {
			const extracted = extractHeadingsFromDOM();
			setHeadings(extracted);
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [initialHeadings]);

	useEffect(() => {
		if (headings.length === 0) return undefined;

		const observerOptions = {
			root: null,
			rootMargin: '-20% 0px -70% 0px',
			threshold: 0,
		};

		const observerCallback = (entries: IntersectionObserverEntry[]) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					setActiveId(entry.target.id);
				}
			});
		};

		const observer = new IntersectionObserver(
			observerCallback,
			observerOptions,
		);

		// すべての見出し要素を監視
		headings.forEach((heading) => {
			const element = document.getElementById(heading.id);
			if (element) {
				observer.observe(element);
			}
		});

		return () => {
			observer.disconnect();
		};
	}, [headings]);

	const scrollToHeading = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			const offset = 100; // ヘッダー分のオフセット
			const elementPosition = element.getBoundingClientRect().top;
			const offsetPosition = elementPosition + window.pageYOffset - offset;

			window.scrollTo({
				top: offsetPosition,
				behavior: 'smooth',
			});
		}
	};

	if (headings.length === 0) {
		return null;
	}

	return (
		<nav className="table-of-contents table-of-contents-sticky">
			<div className="table-of-contents-header">
				<span className="table-of-contents-title">目次</span>
			</div>
			<ul className="table-of-contents-list">
				{headings.map((heading) => (
					<li
						key={heading.id}
						className={`table-of-contents-item table-of-contents-item-level-${heading.level} ${
							activeId === heading.id ? 'table-of-contents-item-active' : ''
						}`}
					>
						<a
							href={`#${heading.id}`}
							onClick={(e) => {
								e.preventDefault();
								scrollToHeading(heading.id);
							}}
							className="table-of-contents-link"
						>
							{heading.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
};

export { TableOfContents };
