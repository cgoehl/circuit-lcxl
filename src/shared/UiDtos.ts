import { IPoint2 } from "./utils";

export type UiControl 
	=	UiParameter
	| UiGrid;

export type UiOrientation = 'centered' | 'zeroBased';

export interface UiState {
	controllerAnchor: IPoint2,
	controllerPage: number,
	synthNumber: 0 | 1,
}

export interface UiParameter {
	type: 'parameter',
	label: string,
	color: string,
	minValue: number,
	maxValue: number,
	address: number,
	orientation: UiOrientation,
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