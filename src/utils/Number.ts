export function numberToIEEE754HexString(n: number): string {
	const buffer = new ArrayBuffer(8);
	const view = new DataView(buffer);
	view.setFloat64(0, n);

	return Array.from(new Uint8Array(buffer))
		.map((x) => x.toString(16).padStart(2, '0'))
		.join('');
}
