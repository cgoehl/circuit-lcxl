import { UiGrid, UiParameter } from "../../shared/UiParameter";
import { IPoint2 } from "../../shared/utils";

export class UiLayout {

	items: UiParameter[];

	constructor(
		readonly columns: number,
		readonly rows: number
	) {
		this.items = Array.from(new Array<UiParameter>(columns * rows)).map(e => null);
	}

	addRect = (offset: IPoint2, width: number, items: UiParameter[]) => {
		items.forEach((item, i) => {
			const x = offset.x + i % width;
			const y = offset.y + Math.floor(i / width);
			this.setAt({ x, y }, item);
		});
	};

	addRow = (offset: IPoint2, items: UiParameter[]) => {
		items.forEach((item, i) => {
			const x = offset.x + i;
			const y = offset.y;
			this.setAt({ x, y }, item);
		});
	};

	addCol = (offset: IPoint2, items: UiParameter[]) => {
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
}
