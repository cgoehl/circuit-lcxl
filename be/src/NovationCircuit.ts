import { getInputs, getOutputs, Input, Output, Channel } from 'easymidi';
import { BaseDevice, detectMidi, IMidiIO } from './BaseDevice';


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
