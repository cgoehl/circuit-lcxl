import { getInputs, getOutputs, Input, Output, Channel } from 'easymidi';
import { ICloseable } from "./ICloseable";


export interface CircuitChannelConfig {
	readonly synth1: Channel,
	readonly synth2: Channel,
	readonly drums: Channel,
}

export class NovationCircuit implements ICloseable {

	static readonly defaultChannels: CircuitChannelConfig = {
		synth1: 4,
		synth2: 5,
		drums: 6,
	};

	constructor(
		public readonly channels: CircuitChannelConfig,
		public readonly input: Input,
		public readonly output: Output) { }

	close() {
		this.input.close();
		this.output.close();
	}

	static detect(): NovationCircuit | null {
		const isCircuit = (name: String) => name.startsWith('Circuit');
		const inputName = getInputs().find(isCircuit);
		const outputName = getOutputs().find(isCircuit);
		if (inputName && outputName) {
			return new NovationCircuit(NovationCircuit.defaultChannels, new Input(inputName), new Output(outputName));
		}
	}
}
