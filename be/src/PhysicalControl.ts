
export interface PhysicalControl {
	readonly group: string,
	readonly index: number,
	readonly row: number,
	readonly col: number,
};

export class PhysicalKnob implements PhysicalControl {
	value: number | null = null;
	constructor(
		readonly group: string,
		readonly index: number,
		readonly row: number,
		readonly col: number,
		) { }
}

export class PhysicalButton implements PhysicalControl {
	isPressed: boolean = false;

	constructor(
		readonly group: string,
		readonly index: number,
		readonly row: number,
		readonly col: number,
		) { }
}
