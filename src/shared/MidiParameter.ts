export interface MidiParameter {
	manufacturer: string;
	device: string;
	section: string;
	name: string;
	sysexAddress: number;
	protocol: MidiParameterProtocol;
	orientation: 'centered' | 'zeroBased',
	valueNames: null | { [key: string]: string },
}

export type MidiParameterProtocol = MidiCc | MidiNrpn;

export interface MidiCc {
	type: 'cc';
	msb: number;
	lsb: number | null;
	minValue: number;
	maxValue: number;
}

export interface MidiNrpn {
	type: 'nrpn';
	msb: number;
	lsb: number;
	minValue: number;
	maxValue: number;
}

export interface ParameterSection {
	name: string;
	parameters: MidiParameter[];
}