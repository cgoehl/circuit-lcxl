import { State } from '@hookstate/core';
import React from 'react';
import { UiGrid } from '../../shared/UiParameter';
import { IPoint2 } from '../../shared/utils';
import { ICircuitState } from '../state/store';
import { GridComponent } from './GridComponent';

import './LayoutComponent.scss';


export function LayoutComponent(props: {
	circuitState: State<ICircuitState>;
	layout: UiGrid;
	controllerAnchor: IPoint2,
}) {
	const { circuitState, layout, controllerAnchor } = props;
	// const paramsByName = arrayToObject(params, p => p.name);
	return (
		<div>
			<GridComponent patchState={circuitState.patch0} layout={layout} controllerAnchor={controllerAnchor} />
		</div>
	);
}
