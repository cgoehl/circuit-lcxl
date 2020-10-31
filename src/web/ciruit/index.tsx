import { State } from '@hookstate/core';
import React from 'react';
import { UiGrid, UiParameter } from '../../shared/UiParameter';
import { KnobComponent } from '../controls/KnobComponent';
import { ICircuitPatchState, ICircuitState } from '../state/store';
import './index.scss';

export function NullComponent() {
	return (
		<div className='_null'></div>
	);
}

export function ParameterComponent(props: {
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


export function GridComponent(props: {
	patchState: State<ICircuitPatchState>,
	// params: { [key: string]: MidiParameter },
	layout: UiGrid,
}) {
	const { patchState, layout } = props;
	return (
		<div className='circuit-patch'>
			<div className='_params' style={{ gridTemplateColumns: `repeat(${layout.columns}, 1fr)`}}>
				{layout.items.map((param, index) => {
					if (!param) {
						return <NullComponent key={index} />
					}
					const value = patchState.bytes[param.address || -1].get();
					return <ParameterComponent value={value} param={param} key={index} />
				})}
			</div>
		</div>
	)
}

export function LayoutComponent(props: { 
	circuitState: State<ICircuitState>,
	layout: UiGrid,
}) {
	const { circuitState, layout } = props;
	// const paramsByName = arrayToObject(params, p => p.name);
	return (
		<div>
			<GridComponent patchState={circuitState.patch0} layout={layout} />
		</div>
	);
}