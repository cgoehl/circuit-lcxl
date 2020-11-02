import React from 'react';
import { UiParameter } from '../../shared/UiParameter';
import { KnobComponent } from '../controls/KnobComponent';


export function ParameterComponent(props: {
	param: UiParameter;
	value: number;
}) {
	const { value, param } = props;
	const { label, minValue, maxValue } = param;
	// if (minValue !== 0) {
	// 	return <div>minValue !== 0: {JSON.stringify(p)}</div>
	// }
	const v = (value - minValue) / (maxValue - minValue);
	return (
		<div className='_param'>
			<KnobComponent value={v} label={value?.toString()} />
			<div>{label}</div>
		</div>);
}
