import { getInputs, getOutputs, Input, Output, Channel } from 'easymidi';
import { Path } from 'typescript';
import { BaseDevice, detectMidi, IMidiIO } from '../BaseDevice';
import { MidiParameter, MidiParameterProtocol, ParameterSection } from '../MidiParameter';
import { arrayToObject, compareBy } from '../../shared/utils';
import { circuitSysex } from './ciruitSysex';
import { readControls as readMidiMapping } from './midiMappingRead';
import { CircuitPatch } from './Patch';
import { Property } from '../../shared/Property';


export class NovationCircuit extends BaseDevice {

	public flatParameters: MidiParameter[];
	public parametersByName: {[name: string]: MidiParameter} = null;
	public parametersByAddress: {[address: string]: MidiParameter} = null;
	// sections: {[key: string]: ParameterSection} = {};

	patch0: Property<CircuitPatch> = null;
	patch1: Property<CircuitPatch> = null;

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
		this.flatParameters = await readMidiMapping(`src/be/NovationCircuit/midiMapping.csv`);
		this.flatParameters.sort(compareBy(p => p.sysexAddress));
		this.parametersByName = arrayToObject(this.flatParameters, p => p.name);
		this.parametersByAddress = arrayToObject(this.flatParameters, p => p.sysexAddress.toString());
		const { input, output } = this.midi;
		input.on('sysex' as any, (msg: any) => this.handleSysex(msg.bytes) as any);
		input.on('program', message => {
			if (message.channel === 1) {
				this.sendPatchDumpRequest(message.channel)
					.then(this.patch1.set);
			} else {
				this.sendPatchDumpRequest(message.channel)
					.then(this.patch0.set);
			}
		});
		const s = Date.now();
		this.patch0 = new Property(await this.sendPatchDumpRequest(0));
		console.log('Patch retirival took', Date.now() - s);
		this.patch1 = new Property(await this.sendPatchDumpRequest(1));
	}

	private __currentDumpRequestSynth: number = 0;
	private __currentDumpRequestPatchExecutor: (p: CircuitPatch) => void = null;
	sendPatchDumpRequest = (synth: number) => {
		const msg = [
			...circuitSysex.header,
			circuitSysex.commands.currentPatchDump,
			synth,
			...circuitSysex.footer,
		]
		this.midi.output.send('sysex' as any, msg as any);
		return new Promise<CircuitPatch>((resolve, reject) => {
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
				this.__currentDumpRequestPatchExecutor(new CircuitPatch(patchData));
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
