import { create } from "domain";
import { MidiParameter } from "../../shared/MidiParameter";
import { UiGrid, UiParameter } from "../../shared/UiParameter";
import { IPoint2 } from "../../shared/utils";
import { IBroker } from "../Broker";
import { Lcxl } from "../NovationLcxl";
import { Knob } from "../PhysicalControl";
import { NovationCircuit } from "./NovationCircuit";

class UiLayout {

	items: UiParameter[];

	constructor(
		readonly columns: number,
		readonly rows: number,
	) {
		this.items = Array.from(new Array<UiParameter>(columns * rows)).map(e => null);
	}

	addRect = (offset: IPoint2, width: number, items: UiParameter[]) => {
		items.forEach((item, i) => {
			const x = offset.x + i % width;
			const y = offset.y + Math.floor(i / width);
			this.setAt({ x, y }, item);
		});
	}

	addRow = (offset: IPoint2, items: UiParameter[]) => {
		items.forEach((item, i) => {
			const x = offset.x + i;
			const y = offset.y;
			this.setAt({ x, y }, item);
		});
	}

	addCol = (offset: IPoint2, items: UiParameter[]) => {
		this.addRect(offset, 1, items);
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

	private setAt = (coords: IPoint2, item: UiParameter) => {
		const thisIndex = this.toIndex(coords)
		const existingItem = this.items[thisIndex];
		if (existingItem) {
			console.error('Attempt to insert into occupied slot:', coords);
		} else {
			this.items[thisIndex] = item;
		}
	}

	getAt = (coords: IPoint2) => this.items[this.toIndex(coords)];

	private toIndex = (coords: IPoint2) => {
		const { x, y } = coords;
		if (x >= this.columns || y >= this.rows) throw new Error(`Coords out of bounds: (${x}|${y})`);
		return x + this.columns * y;
	};
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
			broker.pub(`web/ui`, this.layout.buildGrid());
			circuit.announceState();
		});

		const patchHandler = synthNumber => patch => broker.pub(`web/circuit/patch`, { patch, synthNumber });
		circuit.patch0.on('changed', patchHandler(0));
		circuit.patch1.on('changed', patchHandler(1));

		await broker.sub(`${lcxl.topicPrefix}/event/knob/grid/#`, (payload: Knob) => {
			const { location: { col, row }, value } = payload;
			if (value == null) { return; }
			const uiParam = this.layout.getAt({ x: col, y: row });
			if (!uiParam) { return; }
			const midiParam = circuit.parametersByAddress[uiParam.address];
			if (!midiParam) { return; }
			this.applyUiParamChange(midiParam, value);
		})
	}

	applyUiParamChange = (midiParam: MidiParameter, value: number) => {
		this.circuit.setMidiParam(0, midiParam, value);
	}

	buildUi = (): UiLayout => {
		const midiToUi = (paramName: string, color: string, label?: string): UiParameter => {
			const { sysexAddress, name, valueNames, orientation, protocol: { minValue, maxValue } } = this.circuit.parametersByName[paramName];
			return {
				type: 'parameter',
				label: label || name,
				color,
				minValue,
				maxValue,
				address: sysexAddress,
				orientation,
				valueNames,
			};
		}

		const layout = new UiLayout(16, 8);
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
				midiToUi(paramName, `#aff`, paramName.replace(`osc ${id} `, '')));
		}
		const voiceItems = [
			'Polyphony Mode',
			'Portamento Rate',
			'Pre-Glide',
			'Keyboard Octave',
		].map(name => midiToUi(name, '#afa'));

		layout.addRect({ x: 0, y: 0 }, 2, createOscItems('1'));
		layout.addRect({ x: 2, y: 0 }, 2, createOscItems('2'));
		layout.addRow({ x: 4, y: 0}, voiceItems);



		const filterItems = [
			'routing',
			'drive',
			'drive type',
			'type',
			'frequency',
			'tracking',
			'resonance',
			'Q normalise',
			'env 2 to frequency',
		];

		const mixerItems = [
			`osc 1 level`,
			`osc 2 level`,
			'ring mod level',
			'noise level',
			'pre FX level',
			'post FX level',
		];

		const envItems = [
			'env 2 to frequency',
			'env 1 velocity',
			'env 1 attack',
			'env 1 decay',
			'env 1 sustain',
			'env 1 release',
			'env 2 velocity',
			'env 2 attack',
			'env 2 decay',
			'env 2 sustain',
			'env 2 release',
			'env 3 delay',
			'env 3 attack',
			'env 3 decay',
			'env 3 sustain',
			'env 3 release',
		];

		const lfoItems = [
			'lfo 1 waveform',
			'lfo 1 phase offset',
			'lfo 1 slew rate',
			'lfo 1 delay',
			'lfo 1 delay sync',
			'lfo 1 rate',
			'lfo 1 rate sync',
			'lfo 1 one shot',
			'lfo 1 key sync',
			'lfo 1 common sync',
			'lfo 1 delay trigger',
			'lfo 1 fade mode',
			'lfo 2 waveform',
			'lfo 2 phase offset',
			'lfo 2 slew rate',
			'lfo 2 delay',
			'lfo 2 delay sync',
			'lfo 2 rate',
			'lfo 2 rate sync',
			'lfo 2 one shot',
			'lfo 2 key sync',
			'lfo 2 common sync',
			'lfo 2 delay trigger',
			'lfo 2 fade mode',
		];

		const fxItems = [
			'distortion level',
			'chorus level',
			'EQ bass frequency',
			'EQ bass level',
			'EQ mid frequency',
			'EQ mid level',
			'EQ treble frequency',
			'EQ treble level',
			'distortion type',
			'distortion compensation',
			'chorus type',
			'chorus rate',
			'chorus rate sync',
			'chorus feedback',
			'chorus mod depth',
			'chorus delay',
		];
		return layout;
	}
}
