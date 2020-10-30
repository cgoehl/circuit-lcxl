import { State } from '@hookstate/core';
import React from 'react';
import { UiGrid, UiParameter } from '../../shared/UiParameter';
import { KnobComponent } from '../controls/KnobComponent';
import { ICircuitPatchState, ICircuitState } from '../state/store';
import './index.scss';

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