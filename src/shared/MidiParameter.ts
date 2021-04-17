export interface MidiParameter {
	section: string;
	name: string;
	label: string;
	simpleColor: string;
	sysexAddress: number;	
	minValue: number;
	maxValue: number;
	protocol: MidiParameterProtocol;
	orientation: 'centered' | 'zeroBased',
	valueNames: null | { [key: string]: string },
	modDestination: number | null,
	readLsb: number,
	readMsb: number,
	offset: number,
	uiSlot: UiSlot,
};

export interface UiSlot {
	page: number,
	x: number,
	y: number,
};

export type MidiParameterProtocol = MidiCc | MidiNrpn;

export interface MidiCc {
	type: 'cc';
	msb: number;
}

export interface MidiNrpn {
	type: 'nrpn';
	msb: number;
	lsb: number;
}

export interface ParameterSection {
	name: string;
	parameters: MidiParameter[];
}