import { BaseDevice, detectMidi, IMidiIO } from '../BaseDevice';
import { MidiParameter, MidiParameterProtocol, ParameterSection } from '../../shared/MidiParameter';
import { arrayToObject, compareBy, delay } from '../../shared/utils';
import { circuitSysex } from './ciruitSysex';
import { readControls as readMidiMapping } from './midiMappingRead';
import { CircuitPatch } from './Patch';
import { Property } from '../../shared/Property';


export class NovationCircuit extends BaseDevice {

	public flatParameters: MidiParameter[];
	public parametersByName: {[name: string]: MidiParameter} = null;
	public parametersByAddress: {[address: string]: MidiParameter} = null;
	// sections: {[key: string]: ParameterSection} = {};

	patch0 = new Property<CircuitPatch>(null);
	patch1 = new Property<CircuitPatch>(null);

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
		input.on('program', message => this.sendPatchDumpRequest(message.channel));
		this.sendPatchDumpRequest(0);
		await delay(200);
		this.sendPatchDumpRequest(1);
	}

	private __currentDumpRequestSynth: number = 0;
	// private __currentDumpRequestPatchExecutor: (p: CircuitPatch) => void = null;
	sendPatchDumpRequest = (synth: number) => {
		const msg = [
			...circuitSysex.header,
			circuitSysex.commands.currentPatchDump,
			synth,
			...circuitSysex.footer,
		]
		this.midi.output.send('sysex' as any, msg as any);
		// return new Promise<CircuitPatch>((resolve, reject) => {
			this.__currentDumpRequestSynth = synth;
			
			// this.__currentDumpRequestPatchExecutor = resolve;
		// });
	}

	handleSysex = (msg: number[]): void => {
		const ci = circuitSysex.commandIndex;
		const command = msg[ci];
		switch (command) {
			case circuitSysex.commands.replaceCurrentPatch: {
				const patchData = msg.slice(ci + 3, msg.length - 1)
				const synthNumber = this.__currentDumpRequestSynth;
				const patch = new CircuitPatch(patchData);
				synthNumber === 0
					? this.patch0.set(patch)
					: this.patch1.set(patch);
				this.raiseEvent(['patch'], { patch, synthNumber });
				break;
			}
			default: {
				console.warn('Unsupported command', command, msg);
			}
		}
	}

	announceState = () => {
		// this.raiseEvent(['params'], { parameters: this.flatParameters });
		this.raiseEvent(['patch'], { patch: this.patch0.get(), synthNumber: 0 });
		this.raiseEvent(['patch'], { patch: this.patch1.get(), synthNumber: 1 });
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
