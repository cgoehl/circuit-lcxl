import React from 'react';
import { IAppState } from '../state/store';
import { EnumParameterComponent } from './EnumParameterComponent';
import { ParameterComponent } from './ParameterComponent';
import { connect } from 'react-redux';
import { range } from '../../shared/utils';

import './MatrixComponent.scss';


export function MatrixSlotComponent(props: {
	slotNumber: number,
	source1: number,
	source2: number,
	depth: number,
	destination: number,
	sources: { [key: string]: string },
	destinations: { [key: string]: string },
}) {
	const {	
		slotNumber,
		source1,
		source2,
		depth,
		destination,
		sources,
		destinations,
	} = props;
	return (
		<div className='_slot'>
			<div className='_number'>{slotNumber}</div>
			<EnumParameterComponent value={source1} param={{ label: 'Source 1', color: '#def', valueNames: sources }} />
			<EnumParameterComponent value={source2} param={{ label: 'Source 2', color: '#def', valueNames: sources }} />
			<ParameterComponent value={depth} param={{ label: 'Depth', minValue: 0, maxValue: 127, orientation: 'centered', color: '#fde' }} />
			<EnumParameterComponent value={destination} param={{ label: 'Destination', color: '#fed', valueNames: destinations }} />
		</div>
	);
}

const MatrixSlotContainer = connect((state: IAppState, props: {slotIndex: number}) => {
	const { ui: { layout: { matrix: { slots, destinations, sources }}}, circuit: { patch0: { bytes }} } = state;
	const { slotIndex } = props;
	const {
		slotNumber,
		source1Address,
		source2Address,
		depthAddress,
		destinationAddress,
	} = slots[slotIndex];
	const getValue = (address: number) => bytes[address];
	return {
		slotNumber,
		sources,
		destinations,
		source1: getValue(source1Address),
		source2: getValue(source2Address),
		depth: getValue(depthAddress),
		destination: getValue(destinationAddress),
	};
})(MatrixSlotComponent);

export function MatrixComponent(props: {
	slotCount: number,
}) {
	return (
		<div className='mod-matrix'>
			{ range(props.slotCount).map(index => <MatrixSlotContainer slotIndex={index} key={index} />)}
		</div>
	);
}


export const MatrixContainer = connect((state: IAppState) => {
	const { ui: { layout: { matrix: { slots }}}} = state;
	return { slotCount: slots.length };
})(MatrixComponent);