export type UiControl 
	=	UiParameter
	| UiGrid;

export interface UiParameter {
	type: 'parameter',
	label: string,
	color: string,
	minValue: number,
	maxValue: number,
	address: number,
	orientation: 'centered' | 'zeroBased',
	valueNames: null | { [key: string]: string },
}

export interface UiGrid {
	type: 'grid'
	rows: number,
	columns: number,
	items: UiParameter[];
}