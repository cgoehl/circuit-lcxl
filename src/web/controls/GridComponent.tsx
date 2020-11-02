import { State } from '@hookstate/core';
import React from 'react';
import { UiGrid } from '../../shared/UiParameter';
import { ICircuitPatchState } from '../state/store';
import { NullComponent } from './NullComponent';
import { ParameterComponent } from './ParameterComponent';


export function GridComponent(props: {
	patchState: State<ICircuitPatchState>;
	layout: UiGrid;
}) {
	const { patchState, layout } = props;
	return (
		<div className='layout-grid'>
			<div className='_params' style={{ gridTemplateColumns: `repeat(${layout.columns}, 1fr)` }}>
				{layout.items.map((param, index) => {
					if (!param) {
						return <NullComponent key={index} />;
					}
					const value = patchState.bytes[param.address || -1].get();
					return <ParameterComponent value={value} param={param} key={index} />;
				})}
			</div>
		</div>
	);
}
