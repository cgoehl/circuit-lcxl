import React from 'react';
import { degToRad, polarToCartesian } from '../utils';
import './KnobComponent.scss'

interface IKnobComponentProps {
	label: string,
	value: number,
};


const radius = 50;
const innerRadius = radius * 0.8;

export function KnobComponent(props: IKnobComponentProps) {
	const { label, value } = props;
	const valueCoords = polarToCartesian({ r: innerRadius, phi: degToRad(-105 - (value *  330)) });
	const lAnchor = polarToCartesian({ r: innerRadius, phi: degToRad(-105) });
	const rAnchor = polarToCartesian({ r: innerRadius, phi: degToRad(-75) });
	
	return (
		<svg className="knob" width={radius*2} height={radius*2}>
			<circle cx={radius} cy={radius} r={radius} className="_background"/>
			<g transform={`translate(${radius}, ${radius})`}>
				<line x1={valueCoords.x * 0.6} y1={-valueCoords.y * 0.6} x2={valueCoords.x * 0.8} y2={-valueCoords.y * 0.8} className="_hand"/>
				<path d={`M ${lAnchor.x} ${-lAnchor.y} A ${innerRadius} ${innerRadius} 0 1 1 ${rAnchor.x} ${-rAnchor.y}`} 
					strokeWidth={radius / 10} 
					className="_pie-background"
					/>
				<path d={`M ${lAnchor.x} ${-lAnchor.y} A ${innerRadius} ${innerRadius} 0 ${value > 0.5 ? 1 : 0} 1 ${valueCoords.x} ${-valueCoords.y}`}
					strokeWidth={radius / 30} 
					className="_pie-foreground"
					/>
				<circle cx={valueCoords.x} cy={-valueCoords.y} r={5} className="_dot"/>
				<text className="_label">
					{label}
				</text>
			</g>
		</svg>
	);
}
