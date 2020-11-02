import { State } from '@hookstate/core';
import React from 'react';
import { UiGrid } from '../../shared/UiParameter';
import { ICircuitState } from '../state/store';
import { GridComponent } from './GridComponent';

import './LayoutComponent.scss';


export function LayoutComponent(props: {
	circuitState: State<ICircuitState>;
	layout: UiGrid;
}) {
	const { circuitState, layout } = props;
	// const paramsByName = arrayToObject(params, p => p.name);
	return (
		<div>
			<GridComponent patchState={circuitState.patch0} layout={layout} />
		</div>
	);
}
