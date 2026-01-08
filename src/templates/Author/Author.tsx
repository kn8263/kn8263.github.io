import { AppConfig } from '../../utils/AppConfig';

const Author = () => {
	const { author, description } = AppConfig;
	return (
		<div>
			<a href="/portfolio/index.html">
				<img
					src="/assets/images/author.jpg"
					className="inline-block m-0 rounded-full bg-clip-padding object-cover"
					width="75"
					height="75"
					alt={author}
				/>
			</a>
			<p className="text-zinc-800 text-xs my-2">{description}</p>
		</div>
	);
};
export { Author };
