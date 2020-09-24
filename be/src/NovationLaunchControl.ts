import { getInputs, getOutputs, Input, Output, Channel, Note } from 'easymidi';
import { BaseDevice, IMidiIO } from './BaseDevice';
import { Knob, Button } from './PhysicalControl';



export class NovationLaunchControl extends BaseDevice {
	
	protected commandReceived(command: string[], payload: object): void {
		throw new Error('Method not implemented.');
	}

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

	knobGrid: Knob[] = [];
	buttonGrid: Button[] = [];
	sideButtons: Button[] = [];
	upDownButtons: Button[] = [];
	leftRightButtons: Button[] = [];

	constructor(
		midi: IMidiIO,
		instance: string,
		) {
		super({
			vendor: 'novation',
			model: 'lcxl',
			instance,
		}, midi);
		const knobCCLookup : { [controller: string]: Knob }= {};
		NovationLaunchControl.knobCC.forEach((cc, index) => {
			const knob = new Knob({
				section: 'grid', 
				index, 
				col: index % 8, 
				row: Math.floor(index / 8),
			});
			this.knobGrid.push(knob);
			knobCCLookup[cc] = knob;
		});
		const buttonCCLookup : { [controller: string]: Button }= {};
		NovationLaunchControl.upDownButtonCC.forEach((cc, index) => {
			const button = new Button({ 
				section:'direction', 
				index, 
				col: 0, 
				row: index,
			});
			this.upDownButtons.push(button);
			buttonCCLookup[cc] = button;
		});
		NovationLaunchControl.leftRightButtondCC.forEach((cc, index) => {
			const button = new Button({ 
				section: 'direction', 
				index: index + 2, 
				col: index, 
				row: 0,
			});
			this.upDownButtons.push(button);
			buttonCCLookup[cc] = button;
		});

		const { input } = midi;
		input.on('cc', evt => {
			const { channel, controller, value } = evt;
			const knob = knobCCLookup[controller];
			if (knob) {
				knob.value = value;
				this.raiseEvent(knob.getTopicPath(), knob);
			}
			const button = buttonCCLookup[controller];
			if (button) {
				button.isPressed = value === 127;
				this.raiseEvent(button.getTopicPath(), button);
			}
		});

		const buttonNoteLookup : { [note: string]: Button }= {};
		NovationLaunchControl.buttonNotes.forEach((note, index) => {
			const button = new Button({
				section: 'grid', 
				index, 
				col: index % 8, 
				row: Math.floor(index / 8),
			});
			this.buttonGrid.push(button);
			buttonNoteLookup[note] = button;
		});

		NovationLaunchControl.sideButtonLedNotes.forEach((note, index) => {
			const button = new Button({
				section: 'side', 
				index, 
				col: 0,
				row: index,
			});
			this.sideButtons.push(button);
			buttonNoteLookup[note] = button;
		});

		const handleNote = (eventType: 'noteon' | 'noteoff') => (event: Note) => {
			const { channel, note, velocity } = event;
			const button = buttonNoteLookup[note];
			if (button) {
				button.isPressed = eventType === 'noteon';
				this.raiseEvent(button.getTopicPath(), button);
			}
		}
		input.on('noteon', handleNote('noteon'));
		input.on('noteoff', handleNote('noteoff'));
	}

	static deviceCount = 0;
	static detect(): NovationLaunchControl | null {
		const isLcxl = (name: String) => name.includes('- Launch Control XL');
		const inputName = getInputs().find(isLcxl);
		const outputName = getOutputs().find(isLcxl);
		if (inputName && outputName) {
			const midi = {
				input: new Input(inputName),
				output: new Output(outputName),
			}
			return new NovationLaunchControl(midi, NovationLaunchControl.deviceCount.toString());
		}
	}
}
