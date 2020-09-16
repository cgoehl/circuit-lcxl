import { getInputs, getOutputs, Input, Output, Channel } from 'easymidi';
import { ICloseable } from "./ICloseable";

export interface PhysicalControl {
	readonly name: string,
};

export class PhysicalKnob implements PhysicalControl {
	value: number | null = null;
	readonly minValue = 0;
	readonly maxValue = 127;

	constructor(
		readonly name: string,
	) {}
}

export class PhysicalButton implements PhysicalControl {
	isPressed: boolean = false;

	constructor(
		readonly name: string,
	) {}
}

export class NovationLaunchControl implements ICloseable {

	private static knobLedNotes = [
		13, 29, 45, 61, 77, 93, 109, 125,
		14, 30, 46, 62, 78, 94, 110, 126,
		15, 31, 47, 63, 79, 95, 111, 127,
	];

	private static knobCC = [
		13, 14, 15, 16, 17, 18, 19, 20,
		29, 30, 31, 32, 33, 34, 35, 36,
		49, 50, 51, 52, 53, 54, 55, 56,
		77, 78, 79, 80, 81, 82, 83, 84,
	]

	private static buttonNotes = [
		41, 42, 43, 44, 57, 58, 59, 60,
		73, 74, 75, 76, 89, 90, 91, 92,
	];

	private static sideButtonLedNotes = [ 105, 106, 107, 108 ];

	private static sendButtonLedCC = [ 104, 105 ];

	private static trackButtonLedCC = [ 106, 107 ];

	knobGrid: PhysicalKnob[] = [];

	constructor(
		public readonly input: Input,
		public readonly output: Output) {
		const knobGridCCLookup : { [controller: string]: PhysicalKnob }= {};
		NovationLaunchControl.knobCC.forEach((cc, index) => {
			const knob = new PhysicalKnob(`Grid_${Math.floor(index / 8) + 1}_${index % 8 + 1}`);
			this.knobGrid.push(knob);
			knobGridCCLookup[cc] = knob;
		});
		input.on('cc', evt => {
			const { channel, controller, value } = evt;
			const knob = knobGridCCLookup[controller];
			if (knob) {
				knob.value = value;
				console.log(knob.name, knob.value);
			}
		});
	}

	close() {
		this.input.close();
		this.output.close();
	}

	static detect(): NovationLaunchControl | null {
		const isCircuit = (name: String) => name.startsWith('4- Launch Control XL');
		const inputName = getInputs().find(isCircuit);
		const outputName = getOutputs().find(isCircuit);
		if (inputName && outputName) {
			return new NovationLaunchControl(new Input(inputName), new Output(outputName));
		}
	}
}
