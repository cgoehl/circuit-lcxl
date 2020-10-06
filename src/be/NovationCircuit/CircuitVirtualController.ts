import { MidiParameter } from "../MidiParameter";


export type IVirtualControlItem =
	| IVirtualControlSection
	| IVirtualControlKnob
	| IVirtualControlButton
	;

export type IVirtualControlSection = {
	id: string,
	type: 'section',
	items: IVirtualControlItem[],
}

export type IVirtualControlKnob = {
	id: string,
	type: 'knob',
}

export type IVirtualControlButton = {
	id: string,
	type: 'button',
}



export function buildVirtualLayout(): IVirtualControlSection {

	const createOscSection = (id: string): IVirtualControlSection => {
		return {
			id: `osc ${id}`,
			type: 'section',
			items: [
				{ type: 'knob', id: `osc ${id} level` },
				{ type: 'knob', id: `osc ${id} wave` },
				{ type: 'knob', id: `osc ${id} wave interpolate` },
				{ type: 'knob', id: `osc ${id} pulse width index` },
				{ type: 'knob', id: `osc ${id} virtual sync depth` },
				{ type: 'knob', id: `osc ${id} density` },
				{ type: 'knob', id: `osc ${id} density detune` },
				{ type: 'knob', id: `osc ${id} semitones` },
				{ type: 'knob', id: `osc ${id} cents` },
				{ type: 'knob', id: `osc ${id} pitchbend` },
			]
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