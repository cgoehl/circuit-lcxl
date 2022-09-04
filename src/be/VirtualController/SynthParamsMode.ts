import { IPoint2, range } from "../../shared/utils";
import { SynthNumber } from "../NovationCircuit";
import { LcxlGridColor } from "../NovationLcxl";
import { Action, CircuitVirtualController } from "./CircuitVirtualController";
import { UiLayout } from "./UiLayout";
import { VirtualMode } from "./VirtualMode";


export class SynthParamsMode extends VirtualMode {

	public readonly bottomActions: Action<LcxlGridColor>[] = [];
	public readonly layout: UiLayout;

	constructor (
		controller: CircuitVirtualController,
	) {
		super(controller, 'synthParams');
		const { state } = controller;
		this.bottomActions = [
			{ label: 'Refresh', index: 0, color: () => 'yellow', onPress: () => controller.circuit.reloadPatches() },
			{ label: 'Save', index: 1, color: () => 'redH', onPress: () => controller.save() },
			{
				label: 'Drop Mods',
				index: 4,
				color: () => 'redL',
				onPress: () => {
					controller.dropMacros();
				}
			},
			{ 
				label: 'Synth Number', 
				index: 7, 
				color: () => state.activeSynth === 0
					? 'redL'
					: 'greenL',
				onPress: () => controller.updateState( state => ({...state, activeSynth: [1, 0][state.activeSynth] as SynthNumber }))
			}
		];
		this.layout = this.buildKnobUi();
	}

	protected getKnobLeds = (): LcxlGridColor[] => {
		const { controller: { controllerSize, state: { controllerAnchor } } } = this;
		const controllerGrid = this.layout.subGrid(controllerAnchor, controllerSize);

		return controllerGrid.items
					.map((param) => ( param ? param.simpleColor : 'off' ) as LcxlGridColor );
	}

	public handleControlChange = (col: number, row: number, value: number): void => {
		const { state: { controllerAnchor: { x, y }, activeSynth }, circuit } = this.controller;
		if (value == null) { return; }
		const absVKnob = { x: col + x, y: row + y };
		const uiParam = this.layout.getAt(absVKnob);
		if (!uiParam) { return; }
		const midiParam = circuit.parametersByName[uiParam.name];
		if (!midiParam) { return; }
		circuit.setMidiParamRelative(activeSynth, midiParam, value);
	}

	buildKnobUi = (): UiLayout => {
		const layout = new UiLayout(this.controller.circuit.parametersByName, 16, 8);

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