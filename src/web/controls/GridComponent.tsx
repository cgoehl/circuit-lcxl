import React from 'react';
import { connect } from 'react-redux';
import {  UiParameter } from '../../shared/UiDtos';
import { range } from '../../shared/utils';
import { IAppState } from '../state/store';
import { ControllerAnchorContainer } from './ControllerComponent';
import { EnumParameterComponent } from './EnumParameterComponent';
import { NullComponent } from './NullComponent';
import { ParameterComponent } from './ParameterComponent';

interface CellComponentParams {
	param: UiParameter | null,
	value: number,
}

function CellComponent(props: CellComponentParams) {
	const { param, value } = props;
	if (!param) {
		return <NullComponent />;
	}
	if (param.valueNames) {
		return <EnumParameterComponent value={value} param={param} />;
	}
	return <ParameterComponent value={value} param={param} />;
}

const CellContainer = connect((state: IAppState, props: {index: number}) => {
	const { ui: { layout: { knobs: { items }}, state: { activeSynth }}, circuit } = state;

	const { index } = props;
	const param = items[index];
	if(param) {
		const { address } = param;
		return { 
			param,
			value: (activeSynth === 0 ? circuit.patch0 : circuit.patch1).bytes[address],
		};
	}
	return { param: null, value: -1 };
})(CellComponent);

interface GridComponentProps {
	columns: number,
	itemCount: number,
};

function GridComponent(props: GridComponentProps) {
	const { columns, itemCount } = props;
	return (
		<div className='layout-grid'>
			<div className='_params' style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
				{range(itemCount).map((index) => {
					const col = index % columns;
					const row = Math.floor(index / columns);
					return (
						<div key={index} style={{ gridArea: `${row + 1} / ${col + 1} / ${row + 2} / ${col + 2}`}}>
							<CellContainer index={index}/>
						</div>
					);
				})}
				<ControllerAnchorContainer />
			</div>
		</div>
	);
}


export const GridContainer = connect((state: IAppState): GridComponentProps => {
	const { ui: { layout: { knobs: { columns, items }}}} = state;
	return {
		columns,
		itemCount: items.length
	};
})(GridComponent);