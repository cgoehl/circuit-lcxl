import React from 'react';
import { UiParameter } from '../../shared/UiParameter';
import { KnobComponent } from '../controls/KnobComponent';


export function ParameterComponent(props: {
	param: UiParameter;
	value: number;
}) {
	const { value, param } = props;
	const { label, minValue, maxValue, orientation, color } = param;
	
	let labelValue = value === undefined ? NaN : value;
	if (orientation === 'centered') {
		labelValue = labelValue - Math.ceil((maxValue - minValue) / 2);
	}
	const v = (value - minValue) / (maxValue - minValue);
	return (
		<div className='_param' style={{ backgroundColor: color }}>
			<KnobComponent value={v} label={labelValue.toString()} radius={25}/>
			<div className='_label'>{label}</div>
		</div>);

}
