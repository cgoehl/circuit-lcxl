import React from 'react';
import { getNumberAtBitRange } from '../../shared/utils';
import './EnumParameterComponent.scss';

export function EnumParameterComponent(props: {
	param: { 
		label: string, 
		color: string, 
		valueNames: { [value: string]: string } | null,
		readLsb: number,
		readMsb: number,
	},
	value: number,
}) {
	const { value: rawValue, param } = props;
	const { label, color, valueNames, readLsb, readMsb } = param;
	const value = getNumberAtBitRange(rawValue, readLsb, readMsb);
	console.log(label, rawValue, value, readLsb, readMsb)

	const vn = valueNames || {};
	const renderRow = (v: number) => {
		const entry = vn[v];
		return entry
			? <div className={`_enum-value ${v === value ? '_active' : ''}`}>{entry}</div>
			: <div className='_enum-value'>&nbsp;</div>;
	}

	return (
		<div className='enum-parameter' style={{ backgroundColor: color }}>
			<div className='_enum-values'>
				{renderRow(value + 2)}
				{renderRow(value + 1)}
				{renderRow(value + 0)}
				{renderRow(value - 1)}
				{renderRow(value - 2)}
			</div>

			<div className='_label'>{label}</div>
		</div>);
}
