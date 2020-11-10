import { State } from '@hookstate/core';
import React from 'react';
import { UiGrid, UiModMatrix } from '../../shared/UiParameter';
import { IPoint2 } from '../../shared/utils';
import { ICircuitState, ILayoutState } from '../state/store';
import { GridComponent } from './GridComponent';

import './LayoutComponent.scss';
import { MatrixComponent } from './MatrixComponent';


export function LayoutComponent(props: {
	circuitState: State<ICircuitState>;
	layout: ILayoutState;
	controllerAnchor: IPoint2,
}) {
	const { circuitState, layout, controllerAnchor } = props;
	// const paramsByName = arrayToObject(params, p => p.name);
	return (
		<div>
			<GridComponent patchState={circuitState.patch0} layout={layout.knobs as UiGrid} controllerAnchor={controllerAnchor} />
			{/* <MatrixComponent patchState={circuitState.patch0} layout={layout.matrix as UiModMatrix}/> */}
		</div>
	);
}
