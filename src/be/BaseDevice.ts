import { Console } from "console";
import { ICloseable } from "./ICloseable";
import { getInputs, getOutputs, Input, Output } from "easymidi";
import { DefaultEventMap, EventEmitter } from "tsee";

export interface IMidiIO {
	input: Input,
	output: Output,
}

function attachLogger(io: IMidiIO) {
	const oldEmit = io.input.emit;
  io.input.emit = function() {
		console.log('<==', io.input.name, ...Array.from(arguments));
		oldEmit.apply(io.input, arguments);
  } as any;

	const oldSend = io.output.send;
	io.output.send = function() {
		console.log('==>', io.input.name,  ...Array.from(arguments));
		oldSend.apply(io.output, arguments);
	} as any;
}

export function detectMidi(isDevice: (name: string) => boolean) {
	const inputName = getInputs().find(isDevice);
	const outputName = getOutputs().find(isDevice);
	return {
		input: inputName ? new Input(inputName) : null,
		output: outputName ? new Output(outputName) : null,
	}
}

export abstract class BaseDevice<EventMap extends DefaultEventMap> 
extends EventEmitter<EventMap> implements ICloseable {

	constructor(
		public readonly midi: IMidiIO
	) {
		super();
		attachLogger(midi);
	}


	protected onClose(callback: () => void) {
		this.onCloseCallbacks.push(callback);
	}
	private onCloseCallbacks: Array<(() => void)> = [];
	close(): void {
		this.onCloseCallbacks.forEach(c => c());
		this.onCloseCallbacks = null;
		const { input, output } = this.midi;
		input?.close();
		output?.close();
	}
}
