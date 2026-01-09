export type Heading = {
	id: string;
	text: string;
	level: number;
};

/**
 * HTML文字列から見出し（h2, h3, h4など）を抽出する
 */
export function extractHeadings(html: string): Heading[] {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	const headings = doc.querySelectorAll('h2, h3, h4, h5, h6');
	const result: Heading[] = [];

	headings.forEach((heading) => {
		const text = heading.textContent?.trim() || '';
		if (text) {
			// IDが既に存在する場合はそれを使用、なければ生成
			const { id: existingId } = heading;
			let id = existingId;
			if (!id) {
				// テキストからIDを生成（日本語対応）
				id = text
					.toLowerCase()
					.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g, '-')
					.replace(/^-+|-+$/g, '');

				// ユニークなIDを生成（重複を避ける）
				let uniqueId = id;
				let counter = 1;
				while (doc.getElementById(uniqueId)) {
					uniqueId = `${id}-${counter}`;
					counter += 1;
				}
				id = uniqueId;
				// eslint-disable-next-line no-param-reassign
				heading.id = id;
			}

			const level = parseInt(heading.tagName.charAt(1), 10);
			result.push({
				id,
				text,
				level,
			});
		}
	});

	return result;
}

/**
 * HTML文字列に見出しにIDを付与する
 */
export function addHeadingIds(html: string): string {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	const headings = doc.querySelectorAll('h2, h3, h4, h5, h6');

	headings.forEach((heading) => {
		if (!heading.id) {
			const text = heading.textContent?.trim() || '';
			if (text) {
				const id = text
					.toLowerCase()
					.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g, '-')
					.replace(/^-+|-+$/g, '');

				// ユニークなIDを生成
				let uniqueId = id;
				let counter = 1;
				while (doc.getElementById(uniqueId)) {
					uniqueId = `${id}-${counter}`;
					counter += 1;
				}
				// eslint-disable-next-line no-param-reassign
				heading.id = uniqueId;
			}
		}
	});

	return doc.body.innerHTML;
}
