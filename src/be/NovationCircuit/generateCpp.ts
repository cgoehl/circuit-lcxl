import { isParameter } from "typescript";
import { MidiParameter } from "../../shared/MidiParameter";

const generateSingle = (parameter: MidiParameter) => {
	const {
		section,
		name,
		label,
		simpleColor,
		sysexAddress,	
		minValue,
		maxValue,
		protocol,
		orientation,
		valueNames,
		modDestination,
		readLsb,
		readMsb,
		offset,
		uiSlot: {
			page,
			x,
			y,
		}
	} = parameter;

	const valueNamesCpp = Object.entries(valueNames || {}).map(([k, v]) => `{ ${k}, "${v}" }`).join(', ');
	
	const value = `	{ 
	.section="${section}",
	.name="${name}",
	.label="${label}", 
	.color="${simpleColor}", 
	.orientation=Orientation::${orientation === 'centered' ? 'Centered' : 'ZeroBased'}, 
	.valueNames={ ${valueNamesCpp} }, 
	.minValue=${minValue}, 
	.maxValue=${maxValue}, 
	.patchAddress=${sysexAddress}, 
	.protocol=${protocol.type === 'cc' 
	? `Cc(${protocol.msb})` 
	: `Nrpn(${protocol.lsb}, ${protocol.msb})`}, 
	.modDestination=${modDestination === null ? -1 : modDestination}, 
	.readLsb=${readLsb}, 
	.readMsb=${readMsb}, 
	.offset=${offset},
	.uiSlot=UiSlot(${page}, ${x}, ${y})
}`.replace(/\s+/g, ' ');

	return value;
}

export function generateCpp(params: MidiParameter[]) {
	const map = params
		.filter(p => p.sysexAddress > -1)
		.map(p => `{ "${p.name}", ${generateSingle(p)}},`)
		.join('\n');
	return `#include "./Parameter.hpp"

	namespace Circuit {
		std::map<std::string, Parameter> parameters() {
			return {
${map}
			};
		}
	}`;
}