import { BaseDevice, detectMidi, IMidiIO } from '../BaseDevice';
import { MidiCc, MidiNrpn, MidiParameter } from '../../shared/MidiParameter';
import { arrayToObject, compareBy, delay, setNumberAtBitRange } from '../../shared/utils';
import { circuitSysex } from './ciruitSysex';
import { readControls as readMidiMapping } from './midiMappingRead';
import { CircuitPatch } from './Patch';
import { Property } from '../../shared/Property';
import { generateCpp } from './generateCpp';

export type SynthNumber = 0 | 1;

export class NovationCircuit extends BaseDevice<{
	patchChanged: (synthNumber: SynthNumber, patch: CircuitPatch) => void,
}> {
	
	public flatParameters: MidiParameter[];
	public parametersByName: {[name: string]: MidiParameter} = null;
	public parametersByAddress: {[address: string]: MidiParameter} = null;
	// sections: {[key: string]: ParameterSection} = {};

	patch0 = new Property<CircuitPatch>(null);
	patch1 = new Property<CircuitPatch>(null);

	init = async () => {
		this.flatParameters = await readMidiMapping(`src/be/NovationCircuit/midiMapping.csv`);
		this.flatParameters.sort(compareBy(p => p.sysexAddress));
		this.parametersByName = arrayToObject(this.flatParameters, p => p.name);
		this.parametersByAddress = arrayToObject(this.flatParameters, p => p.sysexAddress.toString());
		const { input, output } = this.midi;
		input.on('sysex' as any, (msg: any) => this.handleSysex(msg.bytes) as any);
		input.on('program', message => this.loadPatch(message.channel as SynthNumber));
		await this.reloadPatches();
	}

	announceState = () => {
		this.raisePatchChange(0);
		this.raisePatchChange(1);
	}

	reloadPatches = async () => {
		this.loadPatch(0);
		await delay(200);
		this.loadPatch(1);
	}
	
	setMidiParamRelative = (synthNumber: SynthNumber, midiParam: MidiParameter, value: number) => {
		const { minValue, maxValue } = midiParam;
		const clampedValue = Math.floor((value/128) * (maxValue - minValue + 1)) + minValue;
		this.setMidiParamAbsolute(synthNumber, midiParam, clampedValue);
	}

	setMidiParamAbsolute = (synthNumber: SynthNumber, midiParam: MidiParameter, value: number) => {
		const { protocol: { type }, offset} = midiParam;
		switch(type) {
			case 'cc': {
				this.setCcParam(synthNumber, midiParam.protocol as MidiCc, value + offset);
				break;
			}
			case 'nrpn': {
				this.setNrpnParam(synthNumber, midiParam.protocol as MidiNrpn, value + offset);
				break;
			}
			default: throw new Error(`Type not implemented: ${type}`);
		}
		this.updatePatch(synthNumber, midiParam, value);
	}

	public getPatch = (synthNumber: SynthNumber): CircuitPatch => {
		return synthNumber === 0
			? this.patch0.get()
			: this.patch1.get();
	}

	private updatePatch = (synthNumber: SynthNumber, midiParam: MidiParameter, value: number) => {
		const { sysexAddress, readLsb, readMsb } = midiParam;
		const target = synthNumber === 0
			? this.patch0
			: this.patch1;
		var currentValue = target.get().bytes[sysexAddress];
		target.get().bytes[sysexAddress] = setNumberAtBitRange(currentValue, value, readLsb, readMsb);
		//todo this is a hack, maybe we should just remove the Property-class entirely
		target.set(target.get());
		this.raisePatchChange(synthNumber);
	}

	private setCcParam = (synthNumber: SynthNumber, protocol: MidiCc, value: number) => {
		const { msb } = protocol;
		this.midi.output.send('cc', { channel: synthNumber, controller: msb, value });
	}

	private setNrpnParam = (synthNumber: SynthNumber, protocol: MidiNrpn, value: number) => {
		const { msb, lsb } = protocol;
		this.midi.output.send('cc', { channel: synthNumber, controller: 99, value: msb });
		this.midi.output.send('cc', { channel: synthNumber, controller: 98, value: lsb });
		this.midi.output.send('cc', { channel: synthNumber, controller: 6, value });
	}
	
	private raisePatchChange = (synthNumber: SynthNumber) => {
		const patch = synthNumber === 0
			?	this.patch0.get()
			:	this.patch1.get();
		this.emit('patchChanged', synthNumber, patch);
	}
	
	private __currentDumpRequestSynth: SynthNumber = 0;
	private loadPatch = (synth: SynthNumber) => {
		const msg = [
			...circuitSysex.header,
			circuitSysex.commands.currentPatchDump,
			synth,
			...circuitSysex.footer,
		]
		this.midi.output.send('sysex' as any, msg as any);
		this.__currentDumpRequestSynth = synth;
	}

	public savePatch = (patch: CircuitPatch, index: number) => {
		if (index < 0 || index > 63) { throw new Error(`Index out of range: ${index}`); }
		const msg = [
			...circuitSysex.header,
			circuitSysex.commands.replacePatch,
			index,
			0,
			...patch.bytes,
			...circuitSysex.footer,
		];
		console.log(`Saving patch: ${index}, msg-len: ${msg.length}`, msg)
		this.midi.output.send('sysex' as any, msg as any);
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
		const result = new NovationCircuit(midi);
		await result.init();
		return result;
	}

	static async generateCpp() {
		const parameters = await readMidiMapping(`src/be/NovationCircuit/midiMapping.csv`);
		const code = await generateCpp(parameters);
		const fs = require('fs');
		fs.writeFileSync('out/parameters.cpp', code);
		return code;
	}
}
