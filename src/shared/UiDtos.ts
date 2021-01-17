import { IPoint2 } from "./utils";

export type UiControl 
	=	UiParameter
	| UiGrid;

export type UiOrientation = 'centered' | 'zeroBased';
export type UiModMatrixMode = 'open' | 'awaitingCombo' | 'closed';


export interface UiState {
	controllerAnchor: IPoint2,
	controllerPage: number,
	activeSynth: 0 | 1,
	modMatrix: {
		slot: number,
		mode: UiModMatrixMode,
	},
}

export interface UiParameter {
	name: string,
	type: 'parameter',
	label: string,
	simpleColor : string,
	minValue: number,
	maxValue: number,
	address: number,
	readLsb: number,
	readMsb: number,
	orientation: UiOrientation,
	modDestination: number | null,
	valueNames: null | { [key: string]: string },
}

export interface UiGrid {
	type: 'grid'
	rows: number,
	columns: number,
	items: UiParameter[],
}

export interface UiModMatrixSlot {
	slotNumber: number,
	source1Address: number,
	source2Address: number,
	depthAddress: number,
	destinationAddress: number,
}

export interface UiModMatrix {
	sources: { [key: string]: string },
	destinations: { [key: string]: string },
	slots: UiModMatrixSlot[],
}