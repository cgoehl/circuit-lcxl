import React from 'react';
import { UiParameter } from '../../shared/UiParameter';
import { compareBy } from '../../shared/utils';


export function EnumParameterComponent(props: {
	param: UiParameter;
	value: number;
}) {
	const { value, param } = props;
	const { label, color, valueNames } = param;

	const vn = valueNames || {};
	// const sorted = Object.entries(vn).sort(compareBy((a: any) => a[0]));
	// const active = sorted.findIndex

	const renderRow = (v: number) => {
		const entry = vn[v];
		return entry
			? <div className={`_enum-value ${v === value ? '_active' : ''}`}>{entry}</div>
			: <div className='_enum-value'>&nbsp;</div>;
	}

	return (
		<div className='_enum' style={{ backgroundColor: color }}>
			<div className='_enum-values'>
				{renderRow(value - 2)}
				{renderRow(value - 1)}
				{renderRow(value + 0)}
				{renderRow(value + 1)}
				{renderRow(value + 2)}
			</div>

			<div className='_label'>{label}</div>
		</div>);
}
