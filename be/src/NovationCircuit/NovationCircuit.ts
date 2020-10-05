import { getInputs, getOutputs, Input, Output, Channel } from 'easymidi';
import { Path } from 'typescript';
import { BaseDevice, detectMidi, IMidiIO } from '../BaseDevice';
import { MidiParameter, MidiParameterProtocol, ParameterSection } from '../MidiParameter';
import { arrayToObject, compareBy } from '../utils';
import { circuitSysex } from './ciruitSysex';
import { readControls as readMidiMapping } from './midiMappingRead';
import { Patch } from './Patch';


export class NovationCircuit extends BaseDevice {

	flatParameters: MidiParameter[];
	parameters: {[key: string]: MidiParameter} = {};
	sections: {[key: string]: ParameterSection} = {};

	patch0: Patch = null;
	patch1: Patch = null;

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
		this.flatParameters = await readMidiMapping(`be/src/NovationCircuit/midiMapping.csv`);
		this.flatParameters.sort(compareBy(p => p.sysexAddress));
		this.parameters = arrayToObject(this.flatParameters.slice().sort(compareBy(e => e.name.toLowerCase())), e => e.name.toLowerCase());
		this.sections = buildSections(this.parameters);
		const { input, output } = this.midi;
		input.on('sysex' as any, (msg: any) => this.handleSysex(msg.bytes) as any);
		input.on('program', message => {
			if (message.channel === 1) {
				this.sendPatchDumpRequest(message.channel)
					.then(patch => this.patch1 = patch);
			} else {
				this.sendPatchDumpRequest(message.channel)
					.then(patch => this.patch0 = patch);
			}
			console.log(this);
		});
		console.log(this);
		this.patch0 = await this.sendPatchDumpRequest(0);
		console.log(this);
		this.patch1 = await this.sendPatchDumpRequest(1);
		console.log(this);
	}

	private __currentDumpRequestSynth: number = 0;
	private __currentDumpRequestPatchExecutor: (p: Patch) => void = null;
	sendPatchDumpRequest = (synth: number) => {
		const msg = [
			...circuitSysex.header,
			circuitSysex.commands.currentPatchDump,
			synth,
			...circuitSysex.footer,
		]
		this.midi.output.send('sysex' as any, msg as any);
		return new Promise<Patch>((resolve, reject) => {
			this.__currentDumpRequestSynth = synth;
			this.__currentDumpRequestPatchExecutor = resolve;
		});
	}

	handleSysex = (msg: number[]): void => {
		const ci = circuitSysex.commandIndex;
		const command = msg[ci];
		switch (command) {
			case circuitSysex.commands.replaceCurrentPatch: {
				const patchData = msg.slice(ci + 2, msg.length - 1)
				this.__currentDumpRequestPatchExecutor(new Patch(this.flatParameters, patchData));
				break;
			}
			default: {
				console.warn('Unsupported command', command, msg);
			}
		}
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
