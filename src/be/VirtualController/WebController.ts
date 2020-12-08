import { EventEmitter } from "tsee";
import { UiModMatrix, UiModMatrixSlot, UiParameter, UiState } from "../../shared/UiDtos";
import { IPoint2, range } from "../../shared/utils";
import { IBroker } from "../Broker";
import { NovationCircuit } from "../NovationCircuit/NovationCircuit";
import { UiLayout } from "./UiLayout";

export class CircuitVirtualController extends EventEmitter<{
	changed: (newValue: UiState) => void,
}>{

	private state : UiState = {
		controllerPage: 0,
		controllerAnchor: { x: 0, y: 0 },
		synthNumber: 0,
		modMatrix: {
			slot: 0,
			mode: 'closed'
		},
	};

	constructor(
		readonly circuit: NovationCircuit,
		readonly broker: IBroker,
	) {
		super();
		this.knobUi = this.buildKnobUi();
		this.modMatrixUi = this.buildModMatrixUi();
	}

	readonly knobUi: UiLayout;
	readonly modMatrixUi: UiModMatrix;

	start = async () => {
		const { broker, circuit } = this;
		await broker.sub(`web/hello`, async (payload: any) => {
			broker.pub(`web/ui/layout/knobs`, this.knobUi.buildGrid());
			broker.pub(`web/ui/layout/mod-matrix`, this.modMatrixUi);
			this.updateState(s => s);
			circuit.announceState();
		});
		circuit.on('patchChanged', (synthNumber, patch) => broker.pub(`web/circuit/patch`, { patch, synthNumber }));
	}


	handleControlChange = (col: number, row: number, value: number) => {
		const { controllerAnchor: { x, y }, modMatrix: { mode, slot }} = this.state;
		if (mode === 'open') {
			if (row !== 0) { return; }
			if (col === 0) {
				this.updateState(s => ({ ...this.state, modMatrix: { mode, slot: Math.floor(value / 127 * (this.modMatrixUi.slots.length - 1)) }}));
			}
			if (col > 3) {
				const s = this.modMatrixUi.slots[slot];
				if(!s) {
					console.warn('out of range', slot);
					return;
				}
				const { source1Address, source2Address, depthAddress, destinationAddress } = s;
				const address = [ source1Address, source2Address, depthAddress, destinationAddress ][col - 4];
				this.circuit.setMidiParam(this.state.synthNumber, this.circuit.parametersByAddress[address], value);
			}
		} else {
			if (value == null) { return; }
			const absVKnob = { x: col + x, y: row + y };
			const uiParam = this.knobUi.getAt(absVKnob);
			if (!uiParam) { return; }
			const midiParam = this.circuit.parametersByName[uiParam.name];
			if (!midiParam) { return; }
			this.circuit.setMidiParam(this.state.synthNumber, midiParam, value);
		}

	}

	updateState = (func: (state: UiState) => UiState) => {
		this.state = func(this.state);
		this.emit('changed', this.state);
		this.broker.pub(`web/ui/state`, this.state);
	}
	
	buildModMatrixUi = (): UiModMatrix => {
		const baseAddress = 124;
		const slots: UiModMatrixSlot[] = range(20)
			.map(i => ({
				slotNumber: i + 1,
				source1Address: baseAddress + i * 4,
				source2Address: baseAddress + i * 4 + 1,
				depthAddress: baseAddress + i * 4 + 2,
				destinationAddress: baseAddress + i * 4 + 3,
			}));
		return {
			sources: this.circuit.parametersByName['mod matrix 1 source 1'].valueNames,
			destinations: this.circuit.parametersByName['mod matrix 1 destination'].valueNames,
			slots,
		}
	}

	buildKnobUi = (): UiLayout => {
		const layout = new UiLayout(this.circuit.parametersByName, 16, 8);

		const osc1Items = [
			// `osc 1 level`,
			`osc 1 semitones`,
			`osc 1 wave interpolate`,
			`osc 1 cents`,
			`osc 1 virtual sync depth`,
			`osc 1 pulse width index`,
			`osc 1 density detune`,
			`osc 1 wave`,
			`osc 1 density`,
			// `osc 1 pitchbend`,
		];
		layout.addRect({ x: 0, y: 0 }, 2, osc1Items);
		const osc2Items = [
			// `osc 2 level`,
			`osc 2 semitones`,
			`osc 2 wave interpolate`,
			`osc 2 cents`,
			`osc 2 virtual sync depth`,
			`osc 2 pulse width index`,
			`osc 2 density detune`,
			`osc 2 wave`,
			`osc 2 density`,
			// `osc 2 pitchbend`,
		];
		layout.addRect({ x: 2, y: 0 }, 2, osc2Items);

		const voiceItems = [
			'Polyphony Mode',
			'Portamento Rate',
			'Pre-Glide',
			'Keyboard Octave',
		];
		layout.addRow({ x: 4, y: 0}, voiceItems);

		const filterItems = [
			'routing',
			'Q normalise',
			'tracking',
			'drive type',
			'type',
			'drive',
			'frequency',
			'resonance',
		];
		layout.addRect({x: 8, y: 0}, 2, filterItems);
		layout.addRow({x: 2, y: 5}, ['env 2 to frequency']);

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
		];
		layout.addRect({ x: 3, y: 4 }, 5, envItems);

		const addEqItems = () => {
			const eqFreq = [
				'EQ bass frequency',
				'EQ mid frequency',
				'EQ treble frequency',
			];
			const eqLevels = [
				'EQ bass level',
				'EQ mid level',
				'EQ treble level',
			];
			const mixerItems = [
				`osc 1 level`,
				`osc 2 level`,
				'ring mod level',
				'noise level',
			];

			const fxMixerItems = [
				'pre FX level',
				'post FX level',
			];

			layout.addRow({x: 0, y: 4}, fxMixerItems);
			layout.addRow({x: 0, y: 6}, eqFreq);
			layout.addRow({x: 0, y: 7}, [ ...eqLevels, ...mixerItems ]);
		};
		addEqItems();

		//LFO1_OneShot	(bit	0),	LFO1_KeySync	(bit	1),	LFO1_CommonSync	(bit	2),	LFO1_DelayTrigger	(bit	3),	LFO1_FadeMode	(bits	4-5)
		const addLfoItems= (coords: IPoint2, lfoNum: 1 | 2) => {
			const lfoItems = [
				`lfo ${lfoNum} one shot`,
				`lfo ${lfoNum} key sync`,
				`lfo ${lfoNum} common sync`,
				`lfo ${lfoNum} delay trigger`,
				`lfo ${lfoNum} fade mode`,
				`lfo ${lfoNum} slew rate`,
				`lfo ${lfoNum} phase offset`,
				`lfo ${lfoNum} rate sync`,
				`lfo ${lfoNum} delay sync`,
				`lfo ${lfoNum} waveform`,
				`lfo ${lfoNum} rate`,
				`lfo ${lfoNum} delay`,
			];
			layout.addRect(coords, 3, lfoItems);
		}
		addLfoItems({ x: 10, y: 0}, 1);
		addLfoItems({ x: 13, y: 0}, 2);

		const addFxItems = () => {
			const distortionItems = [
				'distortion type',
				'distortion compensation',
				'distortion level',
			];

			const chorusItems = [
				'---',
				'---',
				'chorus type',
				'chorus mod depth',
				'chorus rate sync',
				'chorus rate',
				'chorus delay',
				'chorus feedback',
				'chorus level',
			];

			layout.addCol({x: 7, y: 1}, distortionItems);
			layout.addRect({x: 4, y: 1}, 3, chorusItems);
		}
		addFxItems();
		return layout;
	}
}
