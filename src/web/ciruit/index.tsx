import { State } from '@hookstate/core';
import React from 'react';
import { isLabeledStatement } from 'typescript';
import { MidiParameter } from '../../shared/MidiParameter';
import { UiGrid, UiParameter } from '../../shared/UiParameter';
import { arrayToObject, compareBy } from '../../shared/utils';
import { KnobComponent } from '../controls/KnobComponent';
import { ICircuitPatchState, ICircuitState } from '../state/store';
import './index.scss';


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

export function CircuitPatchParameter(props: {
	param: UiParameter,
	value: number,
}) {
	const { value, param } = props;
	const { label, minValue, maxValue } = param;
	// if (minValue !== 0) {
	// 	return <div>minValue !== 0: {JSON.stringify(p)}</div>
	// }
	const v = (value - minValue) / (maxValue - minValue);
	return (
		<div className='_param'>
			<KnobComponent value={v} label={value?.toString()} />
			<div>{label}</div>
		</div>);


}

export function CircuitPatchComponent(props: {
	patchState: State<ICircuitPatchState>,
	// params: { [key: string]: MidiParameter },
	layout: UiGrid,
}) {
	const { patchState, layout } = props;
	return (
		<div className='circuit-patch'>
			<div className='_name'>{patchState.name.get()}</div>
			<div className='_params'>
				{layout.items.map((param: UiParameter) => {
					const value = patchState.bytes[param.address || -1].get();
					return <CircuitPatchParameter value={value} param={param} key={param.address} />
				})}
			</div>
		</div>
	)
}

export function CircuitComponent(props: { 
	circuitState: State<ICircuitState>,
	layout: UiGrid,
}) {
	const { circuitState, layout } = props;
	// const paramsByName = arrayToObject(params, p => p.name);
	return (
		<div>
			<CircuitPatchComponent patchState={circuitState.patch0} layout={layout} />
		</div>
	);
}