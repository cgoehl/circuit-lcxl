import { getInputs, getOutputs, Input, Output, Channel } from 'easymidi';
import { BaseDevice, detectMidi, IMidiIO } from '../BaseDevice';
import { MidiParameter, MidiParameterProtocol, ParameterSection } from '../MidiParameter';
import { arrayToObject, compareBy } from '../utils';
import { readControls as readMidiMapping } from './midiMappingRead';


export interface CircuitChannelConfig {
	readonly synth1: Channel,
	readonly synth2: Channel,
	readonly drums: Channel,
}

export class NovationCircuit extends BaseDevice {

	static readonly defaultChannels: CircuitChannelConfig = {
		synth1: 4,
		synth2: 5,
		drums: 6,
	};

	parameters: {[key: string]: MidiParameter} = {};
	sections: {[key: string]: ParameterSection} = {};

	constructor(
		midi: IMidiIO,
		instance: string,
		) {
		super({
			vendor: 'novation',
			model: 'circuit',
			instance,
		}, midi);
	}

	init = async () => {
		const c = await readMidiMapping(`be/src/NovationCircuit/midiMapping.csv`);
		this.parameters = arrayToObject(c.sort(compareBy(e => e.name.toLowerCase())), e => e.name.toLowerCase());
		this.sections = buildSections(this.parameters);
		console.log(this.parameters)
	}

	static deviceCount = 0;
	static async detect(): Promise<NovationCircuit | null> {
		const midi = detectMidi(name => name.includes('Circuit'));
		if (midi.input === null || midi.output === null) {
			return null;
		}
		const result = new NovationCircuit(midi, NovationCircuit.deviceCount.toString());
		await result.init();
		return result;
	}
}



function buildSections(	parameters: {[key: string]: MidiParameter}): {[key: string]: ParameterSection} {

	const createOscSection = (id: string): ParameterSection => {
		return {
			name: `osc ${id}`,
			parameters: [
				parameters[`osc ${id} level`],
				parameters[`osc ${id} wave`],
				parameters[`osc ${id} wave interpolate`],
				parameters[`osc ${id} pulse width index`],
				parameters[`osc ${id} virtual sync depth`],
				parameters[`osc ${id} density`],
				parameters[`osc ${id} density detune`],
				parameters[`osc ${id} semitones`],
				parameters[`osc ${id} cents`],
				parameters[`osc ${id} pitchbend`],
			]
		}
	}

	const sections = [ 
		createOscSection('1'),	
		createOscSection('2'),	
	];
	return arrayToObject(sections, s => s.name);
}
