import { getInputs, getOutputs, Input, Output, Channel } from 'easymidi';
import { BaseDevice, detectMidi, IMidiIO } from './BaseDevice';
import { createReadStream } from 'fs';
import csvParser = require('csv-parser');
import { MidiParameter, MidiParameterProtocol, ParameterSection } from './MidiParameter';
import { arrayToObject, compareBy } from './utils';


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
		const c = await readControls('be/docs/Circuit.csv');
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

export async function readControls(path: string): Promise<MidiParameter[]> {
	const csvRows = await readFile(path);
	return csvRows.map(convertRow).sort(compareBy(r => r.sysexAddress));
}

export async function readFile(path: string): Promise<object[]> {
	return new Promise((resolve, reject) => {
	const results = [];
	createReadStream(path)
		.pipe(csvParser())
		.on('data', (data) => results.push(data))
		.on('end', () => {
			resolve(results);
		})
		.on('error', reject);
	});
}

const sysexAddressRegex = /sysex patch address: (\d+)/;
const getSysexAddress = (str: string) : number => {
	const matchResult = sysexAddressRegex.exec(str);
	if(matchResult[1]) {
		return Number.parseInt(matchResult[1]);
	}
	throw new Error(`No match for: ${str}`);
}

function convertRow(row: any): MidiParameter {
	const {
		manufacturer,
		device,
		section,
		parameter_name,
		parameter_description,
		cc_msb,
		cc_lsb,
		cc_min_value,
		cc_max_value,
		nrpn_msb,
		nrpn_lsb,
		nrpn_min_value,
		nrpn_max_value,
		orientation,
		notes,
	} = row;
	const protocol: MidiParameterProtocol = cc_msb 
	? {
		type: 'cc',
		msb: Number.parseInt(cc_msb),
		lsb: Number.parseInt(cc_lsb),
		minValue: Number.parseInt(cc_min_value),
		maxValue: Number.parseInt(cc_max_value),
	}
	: {
		type: 'nrpn',
		msb: Number.parseInt(nrpn_msb),
		lsb: Number.parseInt(nrpn_lsb),
		minValue: Number.parseInt(nrpn_min_value),
		maxValue: Number.parseInt(nrpn_max_value),
	};
	const sysexAddress = getSysexAddress(parameter_description);

	return {
		manufacturer,
		device,
		section,
		name: parameter_name,
		sysexAddress,
		protocol,
		orientation: orientation === 'Centered' ? 'centered' : 'zeroBased',
		notes,
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
