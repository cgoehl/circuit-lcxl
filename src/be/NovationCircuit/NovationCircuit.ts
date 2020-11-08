import { BaseDevice, detectMidi, IMidiIO } from '../BaseDevice';
import { MidiCc, MidiNrpn, MidiParameter } from '../../shared/MidiParameter';
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
		input.on('program', message => this.sendPatchDumpRequest(message.channel as 0 | 1));
		this.sendPatchDumpRequest(0);
		await delay(200);
		this.sendPatchDumpRequest(1);
	}

	announceState = () => {
		this.raisePatchChange(0);
		this.raisePatchChange(1);
	}
	
	setMidiParam = (synthNumber: 0 | 1, midiParam: MidiParameter, value: number) => {
		const { protocol: { type }} = midiParam;
		switch(type) {
			case 'cc': {
				this.setCcParam(synthNumber, midiParam.protocol as MidiCc, value);
				break;
			}
			case 'nrpn': {
				this.setNrpnParam(synthNumber, midiParam.protocol as MidiNrpn, value);
				break;
			}
			default: throw new Error(`Type not implemented: ${type}`);
		}
		this.updatePatch(synthNumber, midiParam, value);
	}

	private updatePatch = (synthNumber: 0 | 1, midiParam: MidiParameter, value: number) => {
		const target = synthNumber === 0
			? this.patch0
			: this.patch1;
		target.get().bytes[midiParam.sysexAddress] = value;
		//todo this is a hack, maybe we should just remove the Property-class entirely
		target.set(target.get());
		this.raisePatchChange(synthNumber);
	}

	private setCcParam = (synthNumber: 0 | 1, protocol: MidiCc, value: number) => {
		const { msb } = protocol;
		this.midi.output.send('cc', { channel: synthNumber, controller: msb, value });
	}

	private setNrpnParam = (synthNumber: 0 | 1, protocol: MidiNrpn, value: number) => {
		const { msb, lsb } = protocol;
		this.midi.output.send('cc', { channel: synthNumber, controller: 99, value: msb });
		this.midi.output.send('cc', { channel: synthNumber, controller: 98, value: lsb });
		this.midi.output.send('cc', { channel: synthNumber, controller: 6, value });
	}
	private raisePatchChange = (synthNumber: 0 | 1) => {
		synthNumber === 0
			?	this.raiseEvent(['patch'], { patch: this.patch0.get(), synthNumber })
			:	this.raiseEvent(['patch'], { patch: this.patch1.get(), synthNumber });
	}
	
	private __currentDumpRequestSynth: 0 | 1 = 0;
	private sendPatchDumpRequest = (synth: 0 | 1) => {
		const msg = [
			...circuitSysex.header,
			circuitSysex.commands.currentPatchDump,
			synth,
			...circuitSysex.footer,
		]
		this.midi.output.send('sysex' as any, msg as any);
		this.__currentDumpRequestSynth = synth;
	}

	private handleSysex = (msg: number[]): void => {
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
				this.raisePatchChange(synthNumber);				
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
