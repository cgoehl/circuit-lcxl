const header = [
	0xf0,
	0x00, 0x20, 0x29,
	0x01,
	0x60,
];

const footer = [
	0xf7,
];

const commands = { 
	currentPatchDump: 0x40,
	replaceCurrentPatch: 0x0,
};

export const circuitSysex = {
	header,
	footer,
	commands,
	commandIndex: header.length,
}