import { Note, ControlChange } from 'easymidi';
import { BaseDevice, detectMidi, IMidiIO } from '../BaseDevice';
import { Knob, Button } from '../PhysicalControl';
import { range } from '../../shared/utils';

class LcxlLedEncoder {
	colorCodes = {
		off: 12,
		redL: 13,
		redH: 15,
		amberL: 29,
		amberH: 63,
		yellow: 62,
		greenL: 28,
		greenH: 60,
	};

	blinkCodes = {
		red: 11,
		amber: 59,
		yellow: 58,
		green: 56,
	};

	rangeColors = [ 'greenH', 'greenL', 'yellow', 'amberH', 'redL', 'redH'];

	colorCodeInRange = (value: number, min: number = 0, max: number = 127): number => {
		const valueIn = Math.min(Math.max(min, value), max);
		const rangeIn = max - min;
		const relativeIn = (valueIn - min) / rangeIn;
		const rangeOut = this.rangeColors.length - 1;
		const index = Math.floor(rangeOut * relativeIn);
		return this.colorCodes[this.rangeColors[index]];
	};

	getColor = (color: number | string) => {
		return typeof color === 'string'
			? this.colorCodes[color]
			: this.colorCodeInRange(color);
	}
}

export class Lcxl extends BaseDevice<{
	knob: (knob: Knob) => void;
	directionButton: (button: Button) => void;
	sideButton: (button: Button) => void;
	gridButton: (button: Button) => void;
}> {
	
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
		...Lcxl.knobLedNotes,
		...Lcxl.buttonNotes,
	];

	private static sideButtonLedNotes = [ 105, 106, 107, 108 ];
	private static upDownButtonCC = [ 104, 105 ];
	private static leftRightButtondCC = [ 106, 107 ];

	private static ledEncoder = new LcxlLedEncoder();

	knobGrid: Knob[] = [];
	buttonGrid: Button[] = [];
	sideButtons: Button[] = [];
	upDownButtons: Button[] = [];
	leftRightButtons: Button[] = [];

	private setNoteLed = (note: number) => (color: number | string) => {
		const value = Lcxl.ledEncoder.getColor(color);
		const message: Note = { channel: 8, note, velocity: value };
		this.midi.output.send('noteon', message);
	}

	private setCcLed = (controller: number) => (color: number | string) => {
		const value = Lcxl.ledEncoder.getColor(color);
		const message: ControlChange = { channel: 8, controller, value };
		this.midi.output.send('cc', message);
	}

	setDirectionLed = (index: number, color: number | string): void => {
		this.setCcLed(104 + index)(color);
	}

	setGridLed = (index: number, color: number | string): void => 
		this.setNoteLed(Lcxl.gridLedNotes[index])(color);

	clearLeds = () => {
		range(Lcxl.gridLedNotes.length).forEach(i => this.setGridLed(i, 'off'));
	}


	init = async () => {

		const knobCCLookup : { [controller: string]: Knob }= {};
		Lcxl.knobCC.forEach((cc, index) => {
			const knob = new Knob({
				section: 'grid', 
				index, 
				col: index % 8, 
				row: Math.floor(index / 8),
			});
			this.knobGrid.push(knob);
			knobCCLookup[cc] = knob;
		});
		const buttonCCLookup : { [controller: string]: Button } = {};
		Lcxl.upDownButtonCC.forEach((cc, index) => {
			const button = new Button({ 
				section:'direction', 
				index, 
				col: 0, 
				row: index,
			});
			this.upDownButtons.push(button);
			buttonCCLookup[cc] = button;
		});
		Lcxl.leftRightButtondCC.forEach((cc, index) => {
			const button = new Button({ 
				section: 'direction', 
				index: index + 2, 
				col: index, 
				row: 0,  
			});
			this.upDownButtons.push(button);
			buttonCCLookup[cc] = button;
		});

		const { input } = this.midi;
		input.on('cc', evt => {
			const { channel, controller, value } = evt;
			const knob = knobCCLookup[controller];
			if (knob) {
				knob.value = value;
				this.emit('knob', knob);
			}
			const button = buttonCCLookup[controller];
			if (button) {
				button.isPressed = value === 127;
				this.emit('directionButton', button);
			}
		});

		const buttonNoteLookup : { [note: string]: Button }= {};
		Lcxl.buttonNotes.forEach((note, index) => {
			const button = new Button({
				section: 'grid', 
				index, 
				col: index % 8, 
				row: Math.floor(index / 8),
			});
			this.buttonGrid.push(button);
			buttonNoteLookup[note] = button;
		});

		Lcxl.sideButtonLedNotes.forEach((note, index) => {
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
				button.location.section === 'grid'
					? this.emit('gridButton', button)
					: this.emit('sideButton', button);
			}
		}
		input.on('noteon', handleNote('noteon'));
		input.on('noteoff', handleNote('noteoff'));
	}


	static deviceCount = 0;
	static async detect(): Promise<Lcxl | null> {
		const midi = detectMidi((name: String) => name.includes('Launch Control XL'));
		if (midi.input === null || midi.output === null) {
			return null;
		}
		const result = new Lcxl(midi);
		await result.init();
		return result;
	}
}
