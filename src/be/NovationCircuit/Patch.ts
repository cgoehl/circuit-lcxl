import { MidiParameter } from "../MidiParameter";
import { arrayToObject, asciiToString } from "../../shared/utils";
import { circuitSysex } from "./ciruitSysex";
import { IVirtualControlItem, IVirtualControlSection } from "../../shared/VirtualControl";


export class CircuitPatch {

	name: string;
	category: number;
	genre: number;

	private parametersByName: {[name: string]: MidiParameter} = null;
	private parametersByAddress: {[address: string]: MidiParameter} = null;

	constructor(
		public readonly parameters: MidiParameter[],
		public readonly patch: number[]
	) {
		this.name = asciiToString(patch.slice(0, 16));
		this.category = patch[16];
		this.genre = patch[17];
		this.parametersByName = arrayToObject(parameters, p => p.name);
		this.parametersByAddress = arrayToObject(parameters, p => p.sysexAddress.toString());
	}

	buildVirtualLayout(): IVirtualControlSection {
		const createOscSection = (id: string): IVirtualControlSection => {
			const items = [
				`osc ${id} level`,
				`osc ${id} wave`,
				`osc ${id} wave interpolate`,
				`osc ${id} pulse width index`,
				`osc ${id} virtual sync depth`,
				`osc ${id} density`,
				`osc ${id} density detune`,
				`osc ${id} semitones`,
				`osc ${id} cents`,
				`osc ${id} pitchbend`,
			].map((paramName: string): IVirtualControlItem => {
				const { sysexAddress, name } = this.parametersByName[paramName];
				return {
					type: 'knob',
					id: `circuit-patch-${sysexAddress}`,
					label: name,
				};
			});
			return {
				id: `circuit-patch-osc_${id}`,
				type: 'section',
				label: 'OSC1',
				items,
			}
		}
	
		return { 
			id: 'Circuit Virtual Control',
			type: 'section',
			items: [{
					id: 'Common',
					type: 'section',
					items: [
						{type: 'button', id: 'Synth 1'},
						{type: 'button', id: 'Synth 2'}
					]
				},
				createOscSection('1'),
				createOscSection('2'),
			]
		};
	}
}