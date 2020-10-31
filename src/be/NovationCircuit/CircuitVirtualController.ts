import { create } from "domain";
import { UiGrid, UiParameter } from "../../shared/UiParameter";
import { IPoint2 } from "../../shared/utils";
import { IBroker } from "../Broker";
import { Lcxl } from "../NovationLcxl";
import { NovationCircuit } from "./NovationCircuit";

class UiLayout {
	
	items: UiParameter[];
	
	constructor (
readonly columns: number,
readonly rows: number,		
	) {
		this.items = Array.from(new Array<UiParameter>(columns * rows)).map(e => null);
	}

	add = (offset: IPoint2, width: number, items: UiParameter[]) => {
		items.forEach((item, i) => {
			const x = offset.x + i % width;
			const y = offset.y + Math.floor(i / width);
			const thisIndex = this.toIndex({ x, y })
			const existingItem = this.items[thisIndex];
			if (existingItem) {
				console.error('Attempt to insert into occupied slot:', x, y);
			} else {
				this.items[thisIndex] = item;
			}
		});
	}

	buildGrid = (): UiGrid => {
		const { columns, rows, items } = this;
		return {
			type: 'grid',
			columns,
			rows,
			items,
		}
	}

	private toIndex = (coords: IPoint2) => coords.x + this.columns * coords.y;
}

export class CircuitVirtualContorller {
	constructor(
		readonly lcxl: Lcxl,
		readonly circuit: NovationCircuit,
		readonly broker: IBroker,
	) {
		this.layout = this.buildUi();
	}

	readonly layout: UiLayout;


	start = async () => {
		const { broker, lcxl, circuit } = this;
		lcxl.clearLeds();
		await broker.sub(`web/hello`, async (payload: any) => {

			broker.pub(
				`web/ui`,
				this.layout.buildGrid(),
			);
			circuit.announceState();
			lcxl.announceState();
		});

		const patchHandler = synthNumber => patch => broker.pub(`web/circuit/patch`, { patch, synthNumber });
		circuit.patch0.on('changed', patchHandler(0));
		circuit.patch1.on('changed', patchHandler(1));
	}

	buildUi = (): UiLayout => {

		const midiToUi = (paramName: string, label?: string): UiParameter => {
			const { sysexAddress, name, protocol: { minValue, maxValue } } = this.circuit.parametersByName[paramName];
			return {
				type: 'parameter',
				label: label || paramName,
				minValue,
				maxValue,
				address: sysexAddress,
			};
		}

		const createOscItems = (id: string): UiParameter[] => {
			return [
				// `osc ${id} level`,
				`osc ${id} semitones`,
				`osc ${id} wave interpolate`,
				`osc ${id} cents`,
				`osc ${id} virtual sync depth`,
				`osc ${id} pulse width index`,
				`osc ${id} density detune`,
				`osc ${id} wave`,
				`osc ${id} density`,
				// `osc ${id} pitchbend`,
			].map((paramName: string): UiParameter => 
				midiToUi(paramName,  paramName.replace(`osc ${id} `, '')));
		}
		
		const layout = new UiLayout(8, 4);
		layout.add({ x: 0, y: 0 }, 2, createOscItems('1') );
		layout.add({ x: 2, y: 0 }, 2, createOscItems('2') );

		return layout;
	}
}
