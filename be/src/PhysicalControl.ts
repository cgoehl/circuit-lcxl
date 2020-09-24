
export interface IPhysicalControl {
	readonly group: string,
	readonly index: number,
	readonly col: number,
	readonly row: number,
	getTopicPath(): string[];
};

const getTopicPathC = ( type: string, { group, index, col, row }: IPhysicalControl) => () => [type, group, col.toString(), row.toString(), index.toString()];

export class PhysicalKnob implements IPhysicalControl {
	value: number | null = null;
	constructor(
		readonly group: string,
		readonly index: number,
		readonly col: number,
		readonly row: number,
		) { }
	getTopicPath = getTopicPathC('knob', this);
}

export class PhysicalButton implements IPhysicalControl {
	isPressed: boolean = false;

	constructor(
		readonly group: string,
		readonly index: number,
		readonly col: number,
		readonly row: number,
		) { }
	getTopicPath = getTopicPathC('button', this);
	
}
