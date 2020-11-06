import { MidiParameter } from "../../shared/MidiParameter";
import { UiGrid, UiParameter } from "../../shared/UiParameter";
import { IPoint2 } from "../../shared/utils";

export class UiLayout {

	items: UiParameter[];

	constructor(
		readonly parameters: {[name: string]: MidiParameter},
		readonly columns: number,
		readonly rows: number
	) {
		this.items = Array.from(new Array<UiParameter>(columns * rows)).map(e => null);
	}

	addRect = (offset: IPoint2, width: number, items: string[]) => {
		items.forEach((item, i) => {
			const x = offset.x + i % width;
			const y = offset.y + Math.floor(i / width);
			this.setAt({ x, y }, this.createUi(item));
		});
	};

	addRow = (offset: IPoint2, items: string[]) => {
		items.forEach((item, i) => {
			const x = offset.x + i;
			const y = offset.y;
			this.setAt({ x, y }, this.createUi(item));
		});
	};

	addCol = (offset: IPoint2, items: string[]) => {
		this.addRect(offset, 1, items);
	};

	buildGrid = (): UiGrid => {
		const { columns, rows, items } = this;
		return {
			type: 'grid',
			columns,
			rows,
			items,
		};
	};

	private setAt = (coords: IPoint2, item: UiParameter) => {
		const thisIndex = this.toIndex(coords);
		const existingItem = this.items[thisIndex];
		if (existingItem) {
			console.error('Attempt to insert into occupied slot:', coords);
		} else {
			this.items[thisIndex] = item;
		}
	};

	getAt = (coords: IPoint2) => this.items[this.toIndex(coords)];

	private toIndex = (coords: IPoint2) => {
		const { x, y } = coords;
		if (x >= this.columns || y >= this.rows)
			throw new Error(`Coords out of bounds: (${x}|${y})`);
		return x + this.columns * y;
	};

	private createUi = (name: string): UiParameter => {
		const param = this.parameters[name];
		if (!param ) { throw new Error(`No such parameter: ${name}`); }
		const { sysexAddress, valueNames, orientation, minValue, maxValue, color, label } = param;
		return {
			type: 'parameter',
			label: label,
			color,
			minValue,
			maxValue,
			address: sysexAddress,
			orientation,
			valueNames,
		};
	}
}
