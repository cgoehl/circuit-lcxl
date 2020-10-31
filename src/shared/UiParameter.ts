export type UiControl 
	=	UiParameter
	| UiGrid;

export interface UiParameter {
	type: 'parameter',
	label: string,
	minValue: number,
	maxValue: number,
	address: number,
	valueNames: null | { [key: string]: string },
}

export interface UiGrid {
	type: 'grid'
	rows: number,
	columns: number,
	items: UiParameter[];
}