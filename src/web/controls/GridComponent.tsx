import { State } from '@hookstate/core';
import React from 'react';
import { UiGrid } from '../../shared/UiParameter';
import { IPoint2 } from '../../shared/utils';
import { ICircuitPatchState } from '../state/store';
import { ControllerComponent } from './ControllerComponent';
import { EnumParameterComponent } from './EnumParameterComponent';
import { NullComponent } from './NullComponent';
import { ParameterComponent } from './ParameterComponent';


export function GridComponent(props: {
	patchState: State<ICircuitPatchState>;
	layout: UiGrid;
	controllerAnchor: IPoint2,
}) {
	const { patchState, layout, controllerAnchor } = props;
	return (
		<div className='layout-grid'>
			<div className='_params' style={{ gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))` }}>
				{layout.items.map((param, index) => {
					const col = index % layout.columns;
					const row = Math.floor(index / layout.columns);
					const getComponent = () => {
						if (!param) {
							return <NullComponent key={index}/>;
						}
						const value = patchState.bytes[param.address || -1].get();
						if (param.valueNames) {
							return <EnumParameterComponent value={value} param={param} key={index} />;
						}
						return <ParameterComponent value={value} param={param} key={index} />;
					}
					return (
						<div style={{ gridArea: `${row + 1} / ${col + 1} / ${row + 2} / ${col + 2}`}}>{getComponent()}</div>
					);
				})}
				<ControllerComponent anchor={controllerAnchor} />
			</div>
		</div>
	);
}
