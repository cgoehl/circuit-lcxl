import React from 'react';
import { KnobComponent } from '../controls/KnobComponent';
import './ParameterComponent.scss';

export function ParameterComponent(props: {
	param: {
		label: string,
		minValue: number,
		maxValue: number,
		orientation: string,
		simpleColor: string,
	};
	value: number;
}) {
	const { value, param } = props;
	const { label, minValue, maxValue, orientation, simpleColor } = param;
	
	let labelValue = value === undefined ? NaN : value;
	if (orientation === 'centered') {
		labelValue = labelValue - Math.ceil((maxValue - minValue) / 2);
	}
	const v = (value - minValue) / (maxValue - minValue);
	return (
		<div className={`parameter simple-color-${simpleColor}`}>
			<KnobComponent value={v} label={labelValue.toString()} radius={40}/>
			<div className='_label'>{label}</div>
		</div>);

}
