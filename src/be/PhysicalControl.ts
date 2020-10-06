
export interface IPhysicalLocation {
	readonly section: string,
	readonly index: number,
	readonly col: number,
	readonly row: number,
}

export interface IPhysicalControl {
	location: IPhysicalLocation,
	getTopicPath(): string[],
};

const getTopicPathC = ( type: string, { location: { section, index, col, row }}: IPhysicalControl) => () => [type, section, col.toString(), row.toString(), index.toString()];

export class Knob implements IPhysicalControl {
	value: number | null = null;
	constructor(
		readonly location: IPhysicalLocation,
		) { }
	getTopicPath = getTopicPathC('knob', this);
}

export class Button implements IPhysicalControl {
	isPressed: boolean = false;

	constructor(
		readonly location: IPhysicalLocation,
		) { }
	getTopicPath = getTopicPathC('button', this);
}

