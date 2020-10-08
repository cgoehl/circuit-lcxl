import { IVirtualControlItem, IVirtualControlSection } from "../../shared/VirtualControl";
import { IBroker } from "../Broker";
import { MidiCc, MidiParameter } from "../MidiParameter";
import { Lcxl } from "../NovationLcxl";
import { Knob } from "../PhysicalControl";
import { NovationCircuit } from "./NovationCircuit";
import { CircuitPatch } from "./Patch";

export class CircuitVirtualContorller {
	constructor(
		readonly lcxl: Lcxl,
		readonly circuit: NovationCircuit,
		readonly broker: IBroker,
	) {}


	start = async () => {
		const { broker, lcxl, circuit } = this;
		lcxl.clearLeds();
		await broker.sub(`web/hello`, async (payload: any) => {
			circuit.announceState();
			lcxl.announceState();
		});
		// await broker.sub(`${lcxl.topicPrefix}/event/knob/grid/#`, (payload) => {
			// const { location : { index, row, col }, value } = payload as Knob;
			// broker.pub(`${lcxl.topicPrefix}/command/led/grid/byIdx/${index}`, { color: value });
			// const section = Object.values(circuit.sections)[row];
			// if (section) {
			// 	const param = Object.values(section.parameters)[col];
			// 	if (param) {
			// 		console.log(param.name);
			// 		if (param.protocol.type == 'cc') {
			// 			const cc = param.protocol as MidiCc;
			// 			//todo: create function for clamp
			// 			const clamped = Math.max(cc.minValue, Math.min(cc.maxValue, value));
			// 			const msg = {
			// 				controller: cc.msb,
			// 				value: clamped,
			// 				channel: 0 as Channel,
			// 			};
			// 			console.log(param.name, clamped)
			// 			circuit.midi.output.send('cc', msg);
			// 		} else {
			// 			console.log('Unsupported protocol', param.protocol.type);
			// 		}
			// 	}
			// }
		// });

		// const patchHandler = synthNumber => patch => broker.pub(`web/circuit/patch`, { patch, synthNumber });
		// circuit.patch0.on('changed', patchHandler(0));
		// circuit.patch1.on('changed', patchHandler(1));
	}

	// sendPatchParam(patch: CircuitPatch, synthNumber: number, parameter: MidiParameter) {
	// 	const unsupported = () => console.error('Not yet supported', parameter);
		
	// 	const { sysexAddress, protocol } = parameter;
	// 	switch(protocol.type) {
	// 		case 'cc': 
	// 			const { msb, lsb, minValue, maxValue } = protocol as MidiCc;
	// 			if (lsb) {
	// 				unsupported();
	// 			} else {
	// 				const value = patch.bytes[parameter.sysexAddress];
	// 				this.broker.pub(this.patchParamTopic(synthNumber, sysexAddress), { value, minValue, maxValue });
	// 			}
	// 		break;
	// 		case 'nrpn':
	// 			unsupported();
	// 		break;
	// 	}

	// }

	// patchParamTopic = (synthNumber: number, sysexAddress: number) => `web/vc/patch/${synthNumber}/params/${sysexAddress}`;

	// buildVirtualLayout(circuit: NovationCircuit): IVirtualControlSection {

	// 	const staticItems: IVirtualControlSection[] = [{
	// 		id: 'Common',
	// 		type: 'section',
	// 		label: 'Common',
	// 		items: [
	// 			{type: 'button', id: 'circuit-synth-1', label: 'Synth 1'},
	// 			{type: 'button', id: 'circuit-synth-2', label: 'Synth 2'}
	// 		]
	// 	}];
	
	// 	return { 
	// 		id: 'circuit-virtual-control',
	// 		label: 'Circuit',
	// 		type: 'section',
	// 		items: [
	// 			...staticItems,
	// 			...(circuit.patch0 ? [this.buildPatchLayout(circuit, 0)] : []),
	// 		]
	// 	};
	// }

	// buildPatchLayout(circuit: NovationCircuit, number: number): IVirtualControlSection {
	// 	const createOscSection = (id: string): IVirtualControlSection => {
	// 		const items = [
	// 			`osc ${id} level`,
	// 			`osc ${id} wave`,
	// 			`osc ${id} wave interpolate`,
	// 			`osc ${id} pulse width index`,
	// 			`osc ${id} virtual sync depth`,
	// 			`osc ${id} density`,
	// 			`osc ${id} density detune`,
	// 			`osc ${id} semitones`,
	// 			`osc ${id} cents`,
	// 			`osc ${id} pitchbend`,
	// 		].map((paramName: string): IVirtualControlItem => {
	// 			const { sysexAddress, name } = circuit.parametersByName[paramName];
	// 			return {
	// 				type: 'knob',
	// 				id: this.patchParamTopic(number, sysexAddress),
	// 				label: name.replace(`osc ${id} `, ''),
	// 			};
	// 		});
	// 		return {
	// 			id: `vc/patch/${number}/sections/osc_${id}`,
	// 			type: 'section',
	// 			label: 'OSC1',
	// 			items,
	// 		}
	// 	}
	
	// 	return { 
	// 		id: 'vc',
	// 		type: 'section',
	// 		label: 'Circuit',
	// 		items: [
	// 			createOscSection('1'),
	// 			createOscSection('2'),
	// 		]
	// 	};
	// }
}
