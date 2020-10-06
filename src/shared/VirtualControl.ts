export type IVirtualControlItem =
	| IVirtualControlSection
	| IVirtualControlKnob
	| IVirtualControlButton
	;

export type IVirtualControlSection = {
	id: string,
	type: 'section',
	items: IVirtualControlItem[],
}

export type IVirtualControlKnob = {
	id: string,
	type: 'knob',
}

export type IVirtualControlButton = {
	id: string,
	type: 'button',
}
