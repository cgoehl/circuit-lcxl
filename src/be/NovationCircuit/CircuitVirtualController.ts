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

export class CircuitVirtualController {
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
			const param = this.circuit.parametersByName[paramName];
			if (!param ) { throw new Error(`No such parameter: ${paramName}`); }
			const { sysexAddress, name, valueNames, orientation, protocol: { minValue, maxValue } } = param;
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
		].map(name => midiToUi(name, '#cdc'));
		layout.addRect({x: 8, y: 4}, 8, filterItems);

		const envItems = [
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
		].map((name) => {
			const [_, n, label] = /env (\d) (.*)/.exec(name);
			const green = ((+n) + 10).toString(16);
			const red = (13 - (+n)).toString(16);
			return midiToUi(name, `#f${red}${green}f`, label);
		});

		layout.addRect({ x: 3, y: 4 }, 5, envItems);

		const addEqItems = () => {
			const eqFreq = [
				midiToUi('EQ bass frequency', '#cdd', 'bass freq'),
				midiToUi('EQ mid frequency', '#dcd', 'mid freq'),
				midiToUi('EQ treble frequency', '#ddc', 'high freq'),
			];
			const eqLevels = [
				midiToUi('EQ bass level', '#cdd', 'bass level'),
				midiToUi('EQ mid level', '#dcd', 'mid level'),
				midiToUi('EQ treble level', '#ddc', 'high level'),
			];
			const mixerItems = [
				midiToUi(`osc 1 level`, `#aff`),
				midiToUi(`osc 2 level`, `#aff`),
				midiToUi('ring mod level', `#aff`),
				midiToUi('noise level', `#aff`),
			];

			const fxMixerItems = [
				midiToUi('pre FX level', '#eee'),
				midiToUi('post FX level', '#eee'),
			];


			layout.addRow({x: 0, y: 4}, fxMixerItems);
			layout.addRow({x: 0, y: 6}, eqFreq);
			layout.addRow({x: 0, y: 7}, [ ...eqLevels, ...mixerItems ]);
		};
		addEqItems();


		const addLfoItems= (coords: IPoint2, lfoNum: 1 | 2) => {
			const lfoItems = [
				`lfo ${lfoNum} waveform`,
				`lfo ${lfoNum} phase offset`,
				`lfo ${lfoNum} slew rate`,
				`lfo ${lfoNum} delay`,
				`lfo ${lfoNum} delay sync`,
				`lfo ${lfoNum} rate`,
				`lfo ${lfoNum} rate sync`,
				`lfo ${lfoNum} one shot`,
				`lfo ${lfoNum} key sync`,
				`lfo ${lfoNum} common sync`,
				`lfo ${lfoNum} delay trigger`,
				`lfo ${lfoNum} fade mode`,
			]
			.map(name => midiToUi(name, lfoNum === 1 ? `#daf` : `#adf`, name.replace(`lfo ${lfoNum} `, '')));
			layout.addRect(coords, 3, lfoItems);
		}

		addLfoItems({ x: 10, y: 0}, 1);
		addLfoItems({ x: 13, y: 0}, 2);

		const addFxItems = () => {
			const distortionItems = [
				'distortion level',
				'distortion type',
				'distortion compensation',
			].map(name => midiToUi(name, '#dbd', name.replace('distortion', 'dist.')));

			const chorusItems = [
				'chorus level',
				'chorus type',
				'chorus rate',
				'chorus rate sync',
				'chorus feedback',
				'chorus mod depth',
				'chorus delay',
			].map(name => midiToUi(name, '#ddb', name.replace('distortion', 'dist.')));

			layout.addCol({x: 7, y: 1}, distortionItems);
			layout.addRect({x: 4, y: 1}, 3, chorusItems);
		}
		addFxItems();
		return layout;
	}
}
