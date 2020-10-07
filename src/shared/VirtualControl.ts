export type IVirtualControlItem =
	| IVirtualControlSection
	| IVirtualControlKnob
	| IVirtualControlButton
	;

export type IVirtualControlSection = {
	type: 'section',
	id: string,
	label: string,
	items: IVirtualControlItem[],
}

export type IVirtualControlKnob = {
	type: 'knob',
	id: string,
	label: string,
}

export type IVirtualControlButton = {
	type: 'button',
	id: string,
	label: string,
}
