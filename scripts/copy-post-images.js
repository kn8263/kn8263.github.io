const fs = require('fs');
const path = require('path');

const postsImageDir = path.join(process.cwd(), '_posts_image');
const imagesDest = path.join(
	process.cwd(),
	'public',
	'assets',
	'images',
	'posts',
);

// _posts_imageディレクトリが存在しない場合は作成
if (!fs.existsSync(postsImageDir)) {
	console.log('_posts_image directory does not exist. Creating...');
	fs.mkdirSync(postsImageDir, { recursive: true });
	console.log(
		'_posts_image directory created. Please add your article images there.',
	);
	process.exit(0);
}

// 出力先ディレクトリを作成
if (!fs.existsSync(imagesDest)) {
	fs.mkdirSync(imagesDest, { recursive: true });
}

let copiedCount = 0;

// _posts_image内の各記事ディレクトリを処理
fs.readdirSync(postsImageDir).forEach((articleDir) => {
	const articlePath = path.join(postsImageDir, articleDir);

	// ディレクトリの場合のみ処理
	if (fs.statSync(articlePath).isDirectory()) {
		const destArticleDir = path.join(imagesDest, articleDir);

		// 出力先ディレクトリを作成
		if (!fs.existsSync(destArticleDir)) {
			fs.mkdirSync(destArticleDir, { recursive: true });
		}

		// 画像ファイルをコピー
		fs.readdirSync(articlePath).forEach((file) => {
			if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(file)) {
				const srcFile = path.join(articlePath, file);
				const destFile = path.join(destArticleDir, file);

				fs.copyFileSync(srcFile, destFile);
				console.log(`Copied: ${articleDir}/${file}`);
				copiedCount += 1;
			}
		});
	}
});

if (copiedCount > 0) {
	console.log(`Post images copied successfully! (${copiedCount} files)`);
} else {
	console.log('No post images to copy.');
}
