import { IVirtualControlSection } from "../../shared/VirtualControl";
import { MidiParameter } from "../MidiParameter";
import { NovationCircuit } from "./NovationCircuit";

export function buildVirtualLayout(circuit: NovationCircuit): IVirtualControlSection {

	const staticItems: IVirtualControlSection[] = [{
		id: 'Common',
		type: 'section',
		label: 'Common',
		items: [
			{type: 'button', id: 'circuit-synth-1', label: 'Synth 1'},
			{type: 'button', id: 'circuit-synth-1', label: 'Synth 2'}
		]
	}];

	return { 
		id: 'circuit-virtual-control',
		label: 'Circuit',
		type: 'section',
		items: [
			...staticItems,
			...(circuit.patch0 ? [circuit.patch0.buildVirtualLayout()] : []),
		]
	};
}