
export interface IPhysicalLocation {
	readonly section: string,
	readonly index: number,
	readonly col: number,
	readonly row: number,
}

export interface IPhysicalControl {
	location: IPhysicalLocation,
};


export class Knob implements IPhysicalControl {
	value: number | null = null;
	constructor(
		readonly location: IPhysicalLocation,
		) { }
}

export class Button implements IPhysicalControl {
	isPressed: boolean = false;

	constructor(
		readonly location: IPhysicalLocation,
		) { }
}

