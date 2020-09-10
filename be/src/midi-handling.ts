import { ControlChange, getInputs, getOutputs, Input, Output, Channel, Note } from 'easymidi';
import { mainModule } from 'process';

interface CircuitChannelConfig {
	readonly synth1Channel: Channel,
	readonly synth2Channel: Channel,
	readonly drumsChannel: Channel,
}

class Circuit {

	static readonly defaultChannels : CircuitChannelConfig = {
		synth1Channel: 4,
		synth2Channel: 5,
		drumsChannel: 6,
	}

	constructor(
		public readonly channels: CircuitChannelConfig,
		public readonly input: Input,
		public readonly output: Output,
	) { }


	static detect() : Circuit | null {
		const isCircuit = (name : String) => name.startsWith('Circuit');
		const inputName = getInputs().find(isCircuit);
		const outputName = getOutputs().find(isCircuit);
		if (inputName && outputName) {
			return new Circuit(Circuit.defaultChannels, new Input(inputName), new Output(outputName));
		}
	}
}

function main() {
	const notes = [60,64,32,43];
	const c = Circuit.detect();
	if(c) {
		let i = 0;
		setInterval(() => {
			const note: Note = { channel: c.channels.synth1Channel, note: notes[Math.floor(i/2)], velocity: 100};
			if (i % 2 == 0) {
				c.output.send('noteon', note);
			} else {
				c.output.send('noteoff', note);
			}
			i++;
			i = i >= notes.length * 2 ? 0 : i;
		}, 250);
	}
}

main();