import { createReadStream } from "fs";
import { MidiParameter, MidiParameterProtocol } from "../../shared/MidiParameter";
import { compareBy } from "../../shared/utils";
import csvParser = require("csv-parser");

export async function readControls(path: string): Promise<MidiParameter[]> {
	const csvRows = await readFile(path);
	return csvRows.map(convertRow).sort(compareBy(r => r.sysexAddress));
}

export async function readFile(path: string): Promise<object[]> {
	return new Promise((resolve, reject) => {
	const results = [];
	createReadStream(path)
		.pipe(csvParser())
		.on('data', (data) => results.push(data))
		.on('end', () => {
			resolve(results);
		})
		.on('error', reject);
	});
}

function convertNotes(notes: string): { [key: string]: string } | null {
	if (notes && notes.length) {
		const parts = notes.split('; ');
		const matches = parts.map(p => /(\d+): (.*)/.exec(p));
		if (!matches.every(m => m)) {
			return null;
		}
		const res = {};
		matches.forEach(([_, key, value]) => res[key] = value);
		return res;
	}
	return null;
}

function convertRow(row: any): MidiParameter {
	const {
		section,
		parameter_name,
		min,
		max,
		sysex_addr,
		cc,
		nrpn_msb,
		nrpn_lsb,
		orientation,
		label,
		notes,
		readLsb, 
		readMsb,
		modDest,
		offset,
		simpleColor,
	} = row;
	const protocol: MidiParameterProtocol = cc 
	? {
		type: 'cc',
		msb: Number.parseInt(cc),
	}
	: {
		type: 'nrpn',
		msb: Number.parseInt(nrpn_msb),
		lsb: Number.parseInt(nrpn_lsb),
	};
	const sysexAddress = (sysex_addr && sysex_addr.length) ? +sysex_addr : -1 ;
	const modDestination = (modDest && modDest.length) ? +modDest : null;

	return {
		section,
		name: parameter_name,
		minValue: +min,
		maxValue: +max,
		sysexAddress,
		protocol,
		orientation: orientation === 'Centered' ? 'centered' : 'zeroBased',
		label,
		valueNames: convertNotes(notes),
		modDestination,
		readLsb: +readLsb, 
		readMsb: +readMsb,
		offset: +offset,
		simpleColor,
	};
}