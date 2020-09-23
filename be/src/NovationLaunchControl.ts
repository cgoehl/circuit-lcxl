import { getInputs, getOutputs, Input, Output, Channel, Note } from 'easymidi';
import { ICloseable } from "./ICloseable";
import { PhysicalKnob, PhysicalButton } from './PhysicalControl';
import { broker } from './Broker';

interface IDeviceDescriptor {
	vendor: string,
	model: string,
	instance: string,
}

interface ICommand {

}

interface IEvent {

}

export abstract class BaseDevice implements ICloseable {

	private topicPrefix = '';

	constructor(
		public readonly descriptor: IDeviceDescriptor,
	) {
		const { vendor, model, instance } = descriptor;
		this.topicPrefix=`phy/${vendor}/${model}/${instance}`;
		broker.sub(`${this.topicPrefix}/command/+/#`, this.handleCommand);
	}

	protected abstract commandReceived(command: string[], payload: object): void;

	protected raiseEvent(path: string[], payload: IEvent) {
		broker.pub(
			`${this.topicPrefix}/event/${path.join('/')}`,
			JSON.stringify(payload)
		);
	}

	private handleCommand = (payload: string, topic: string) => {
		const command = topic.replace(`${this.topicPrefix}/command/`, '').split('/');
		this.commandReceived(command, JSON.parse(payload) as ICommand);
	}
	
	protected onClose(callback: () => void) {
		this.onCloseCallbacks.push(callback);
	}
	private onCloseCallbacks: Array<(() => void)> = [];
	close(): void {
		this.onCloseCallbacks.forEach(c => c());
		this.onCloseCallbacks = null;
	}
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

	private static gridLedNotes = [
		...NovationLaunchControl.knobLedNotes,
		...NovationLaunchControl.buttonNotes,
	];

	private static sideButtonLedNotes = [ 105, 106, 107, 108 ];
	private static upDownButtonCC = [ 104, 105 ];
	private static leftRightButtondCC = [ 106, 107 ];

	knobGrid: PhysicalKnob[] = [];
	buttonGrid: PhysicalButton[] = [];
	sideButtons: PhysicalButton[] = [];
	upDownButtons: PhysicalButton[] = [];
	leftRightButtons: PhysicalButton[] = [];

	constructor(
		public readonly input: Input,
		public readonly output: Output) {
		const knobCCLookup : { [controller: string]: PhysicalKnob }= {};
		NovationLaunchControl.knobCC.forEach((cc, index) => {
			const knob = new PhysicalKnob('Knob', index, Math.floor(index / 8), index % 8);
			this.knobGrid.push(knob);
			knobCCLookup[cc] = knob;
		});
		const buttonCCLookup : { [controller: string]: PhysicalButton }= {};
		NovationLaunchControl.upDownButtonCC.forEach((cc, index) => {
			const button = new PhysicalButton('Direction', index, index, 0);
			this.upDownButtons.push(button);
			buttonCCLookup[cc] = button;
		});
		NovationLaunchControl.leftRightButtondCC.forEach((cc, index) => {
			const button = new PhysicalButton('Direction', index + 2, 0, index);
			this.upDownButtons.push(button);
			buttonCCLookup[cc] = button;
		});

		// input.on('cc', evt => {
		// 	const { channel, controller, value } = evt;
		// 	const knob = knobCCLookup[controller];
		// 	if (knob) {
		// 		knob.value = value;
		// 		bus.publish({	type: 'KnobChange',	payload: knob });
		// 	}
		// 	const button = buttonCCLookup[controller];
		// 	if (button) {
		// 		button.isPressed = value === 127;
		// 		bus.publish({	type: 'ButtonChange',	payload: button });
		// 	}
		// });

		// const buttonNoteLookup : { [note: string]: PhysicalButton }= {};
		// NovationLaunchControl.buttonNotes.forEach((note, index) => {
		// 	const button = new PhysicalButton('GridButton', index, Math.floor(index / 8), index % 8);
		// 	this.buttonGrid.push(button);
		// 	buttonNoteLookup[note] = button;
		// });

		// NovationLaunchControl.sideButtonLedNotes.forEach((note, index) => {
		// 	const button = new PhysicalButton('SideButton', index, index, 0);
		// 	this.sideButtons.push(button);
		// 	buttonNoteLookup[note] = button;
		// });

		// const handleNote = (eventType: 'noteon' | 'noteoff') => (event: Note) => {
		// 	const { channel, note, velocity } = event;
		// 	const button = buttonNoteLookup[note];
		// 	if (button) {
		// 		button.isPressed = eventType === 'noteon';
		// 		bus.publish({	type: 'PhysicalButton',	payload: button });
		// 	}
		// }
		// input.on('noteon', handleNote('noteon'));
		// input.on('noteoff', handleNote('noteoff'));

		// bus.subscribe(this.onMessage);
	}

	close() {
		// bus.unsubscribe(this.onMessage);
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
