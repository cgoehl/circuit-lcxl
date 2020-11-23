import React from 'react';
import { IAppState } from '../state/store';
import { EnumParameterComponent } from './EnumParameterComponent';
import { ParameterComponent } from './ParameterComponent';
import { connect } from 'react-redux';
import { range } from '../../shared/utils';

import './MatrixComponent.scss';

const readBits = { readLsb: 0, readMsb: 31 };
const inActiveColor = '#eee';
export function MatrixSlotComponent(props: {
	slotNumber: number,
	source1: number,
	source2: number,
	depth: number,
	destination: number,
	sources: { [key: string]: string },
	destinations: { [key: string]: string },
	isActive: boolean,
}) {
	const {	
		slotNumber,
		source1,
		source2,
		depth,
		destination,
		sources,
		destinations,
		isActive,
	} = props;
	return (
		<div className='_slot'>
			<div className='_number' style={{ backgroundColor: isActive ? '#def' : inActiveColor }}><div>{slotNumber}</div></div>
			<EnumParameterComponent value={source1} param={{ label: 'Source 1', color: isActive ? '#def' : inActiveColor, valueNames: sources, ...readBits }} />
			<EnumParameterComponent value={source2} param={{ label: 'Source 2', color: isActive ? '#def' : inActiveColor, valueNames: sources, ...readBits }} />
			<ParameterComponent value={depth} param={{ label: 'Depth', minValue: 0, maxValue: 127, orientation: 'centered', color: isActive ? '#fde' : inActiveColor }} />
			<EnumParameterComponent value={destination} param={{ label: 'Destination', color: isActive ? '#fed' : inActiveColor, valueNames: destinations, ...readBits }} />
		</div>
	);
}

const MatrixSlotContainer = connect((state: IAppState, props: {slotIndex: number, isActive: boolean}) => {
	const { ui: { layout: { matrix: { slots, destinations, sources }}}, circuit: { patch0: { bytes }} } = state;
	const { slotIndex, isActive } = props;
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
		isActive
	};
})(MatrixSlotComponent);

export function MatrixComponent(props: {
	slotCount: number,
	activeSlot: number,
}) {
	return (
		<div className='mod-matrix'>
			{ range(props.slotCount).map(index => <MatrixSlotContainer slotIndex={index} key={index} isActive={props.activeSlot === index} />)}
		</div>
	);
}


export const MatrixContainer = connect((state: IAppState) => {
	const { ui: { layout: { matrix: { slots }}, state: { modMatrix: { slot }}}} = state;
	return { slotCount: slots.length, activeSlot: slot };
})(MatrixComponent);