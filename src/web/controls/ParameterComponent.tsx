import React from 'react';
import { UiParameter } from '../../shared/UiParameter';
import { KnobComponent } from '../controls/KnobComponent';


export function ParameterComponent(props: {
	param: UiParameter;
	value: number;
}) {
	const { value, param } = props;
	const { label, minValue, maxValue, orientation } = param;
	
	let labelValue = value === undefined ? NaN : value;
	if (orientation === 'centered') {
		labelValue = labelValue - Math.ceil((maxValue - minValue) / 2);
	}
	const v = (value - minValue) / (maxValue - minValue);
	return (
		<div className='_param'>
			<KnobComponent value={v} label={labelValue.toString()} />
			<div>{label}</div>
		</div>);
}
