export interface MidiParameter {
	section: string;
	name: string;
	label: string;
	color: string;
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
}

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