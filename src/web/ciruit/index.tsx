import { State } from '@hookstate/core';
import React from 'react';
import { isLabeledStatement } from 'typescript';
import { MidiParameter } from '../../shared/MidiParameter';
import { arrayToObject, compareBy } from '../../shared/utils';
import { KnobComponent } from '../controls/KnobComponent';
import { ICircuitPatchState, ICircuitState } from '../state/store';


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
	param: MidiParameter,
	value: number,
}) {
	const { value, param } = props;
	const { name, protocol: { minValue, maxValue }, sysexAddress } = param;
	// if (minValue !== 0) {
	// 	return <div>minValue !== 0: {JSON.stringify(p)}</div>
	// }
	const v = (value - minValue) / (maxValue - minValue);
	return (
		<div>
			<KnobComponent value={v} label={value?.toString()} />
			<div>{name}</div>
		</div>);


}

export function CircuitPatchComponent(props: {
	patchState: State<ICircuitPatchState>,
	params: { [key: string]: MidiParameter },
}) {
	const { patchState, params } = props;
	return (
		<div>
			<div>{patchState.name.get()}</div>
			{Object.values(params).sort(compareBy((p: MidiParameter) => p.sysexAddress)).map((p: MidiParameter) => {
				const value = patchState.bytes[p.sysexAddress].get();
				return <CircuitPatchParameter value={value} param={p} key={p.name} />
			})}
		</div>
	)
}

export function CircuitComponent(props: { circuitState: State<ICircuitState> }) {
	const { circuitState } = props;
	const { params } = circuitState.get();
	const paramsByName = arrayToObject(params, p => p.name);
	return (
		<div>
			<CircuitPatchComponent patchState={circuitState.patch0} params={paramsByName} />
		</div>
	);
}