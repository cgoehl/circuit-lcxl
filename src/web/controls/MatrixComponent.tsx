import { State } from '@hookstate/core';
import React from 'react';
import { UiModMatrix } from '../../shared/UiParameter';
import { ICircuitPatchState } from '../state/store';
import { EnumParameterComponent } from './EnumParameterComponent';
import { ParameterComponent } from './ParameterComponent';

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
			<EnumParameterComponent value={source1} param={{ label: 'Source 1', color: '#def', valueNames: sources }} />
			<EnumParameterComponent value={source2} param={{ label: 'Source 2', color: '#def', valueNames: sources }} />
			<ParameterComponent value={depth} param={{ label: 'Depth', minValue: 0, maxValue: 127, orientation: 'centered', color: '#fde' }} />
			<EnumParameterComponent value={destination} param={{ label: 'Destination', color: '#fed', valueNames: destinations }} />
		</div>
	);
}

export function MatrixComponent(props: {
	patchState: State<ICircuitPatchState>,
	layout: UiModMatrix,
}) {
	const {  layout: { slots, sources, destinations }, patchState } = props;
	const getValue = (address: number) => patchState.bytes[address || -1].get();
	return (
		<div className='.mod-matrix'>
			{slots.map(slot => {
				const {
					slotNumber,
					source1Address,
					source2Address,
					depthAddress,
					destinationAddress,
				} = slot;
				return <MatrixSlotComponent 
					key={slotNumber}
					slotNumber={slotNumber}
					sources={sources}
					destinations={destinations}
					source1={getValue(source1Address)}
					source2={getValue(source2Address)}
					depth={getValue(depthAddress)}
					destination={getValue(destinationAddress)}
				/>
			})}
		</div>
	);
}
