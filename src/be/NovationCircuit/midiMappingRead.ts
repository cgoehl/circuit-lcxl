import { createReadStream } from "fs";
import { MidiParameter, MidiParameterProtocol } from "../MidiParameter";
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

const sysexAddressRegex = /sysex patch address: (\d+)/;
const getSysexAddress = (str: string) : number => {
	const matchResult = sysexAddressRegex.exec(str);
	if(matchResult[1]) {
		return Number.parseInt(matchResult[1]);
	}
	throw new Error(`No match for: ${str}`);
}

function convertRow(row: any): MidiParameter {
	const {
		manufacturer,
		device,
		section,
		parameter_name,
		parameter_description,
		cc_msb,
		cc_lsb,
		cc_min_value,
		cc_max_value,
		nrpn_msb,
		nrpn_lsb,
		nrpn_min_value,
		nrpn_max_value,
		orientation,
		notes,
	} = row;
	const protocol: MidiParameterProtocol = cc_msb 
	? {
		type: 'cc',
		msb: Number.parseInt(cc_msb),
		lsb: Number.parseInt(cc_lsb),
		minValue: Number.parseInt(cc_min_value),
		maxValue: Number.parseInt(cc_max_value),
	}
	: {
		type: 'nrpn',
		msb: Number.parseInt(nrpn_msb),
		lsb: Number.parseInt(nrpn_lsb),
		minValue: Number.parseInt(nrpn_min_value),
		maxValue: Number.parseInt(nrpn_max_value),
	};
	const sysexAddress = getSysexAddress(parameter_description);

	return {
		manufacturer,
		device,
		section,
		name: parameter_name,
		sysexAddress,
		protocol,
		orientation: orientation === 'Centered' ? 'centered' : 'zeroBased',
		notes,
	}
}