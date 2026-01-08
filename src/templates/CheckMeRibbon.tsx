type CheckMeRibbonProps = {
	backgroundColor?: string;
	textColor?: string;
	borderColor?: string;
};

const CheckMeRibbon = ({
	backgroundColor = 'bg-rose-700',
	textColor = 'text-white',
	borderColor = 'border-slate-100',
}: CheckMeRibbonProps = {}) => (
	<div className="absolute pointer-events-none overflow-hidden w-[125px] h-[125px] z-10 right-0 top-0">
		<a
			className={`w-[210px] rotate-45 absolute overflow-hidden top-[30px] right-[-60px] text-xs no-underline ${backgroundColor} px-0 py-1 pointer-events-auto shadow-[0_0.15em_0.23em_0_rgba(0,0,0,.5)]`}
			href="https://github.com/kn8263/kn8263.github.io"
			title="Check me on GitHub"
			target="_blank"
		>
			<span
				className={`w-auto block ${borderColor} border-dotted border-y-2 indent-0 text-center no-underline leading-6 ${textColor} break-keep whitespace-nowrap`}
			>
				Check me on GitHub
			</span>
		</a>
	</div>
);

export { CheckMeRibbon };
