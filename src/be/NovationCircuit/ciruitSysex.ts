

const header = (version: number) => [
	0xf0,
	0x00, 0x20, 0x29,
	0x01,
	version,
];

const footer = [
	0xf7,
];

const commands = { 
	currentPatchDump: 0x40,
	replaceCurrentPatch: 0x0,
	replacePatch: 0x01,
};

export const circuitSysex = {
	header,
	footer,
	commands,
	commandIndex: header.length,
}

//[240, 0, 32, 41, 1, 100, 64, 0, 0, 247]