import React from 'react';
import { degToRad, polarToCartesian } from '../utils';
import './KnobComponent.scss'

interface IKnobComponentProps {
	label: string,
	value: number,
};


const radius = 100;
const innerRadius = radius * 0.8;

export function KnobComponent(props: IKnobComponentProps) {
	const { label, value } = props;
	const phi = (value) * Math.PI * 2 - Math.PI * 1.3;
	// const x = Math.cos(phi) * innerRadius + radius;
	// const y = Math.sin(phi) * innerRadius + radius;
	const angle = degToRad(value * 360 - 115);
	const valueCoords = polarToCartesian({ r: innerRadius, phi: degToRad(-105 - (value *  330)) });
	const lAnchor = polarToCartesian({ r: innerRadius, phi: degToRad(-105) });
	const rAnchor = polarToCartesian({ r: innerRadius, phi: degToRad(-75) });
	
	return (
		<svg className="knob" width={radius*2} height={radius*2}>
			<circle cx={radius} cy={radius} r={radius} className="background"/>
			<g transform={`translate(${radius}, ${radius})`}>
				<path d={`M ${lAnchor.x} ${-lAnchor.y} A ${innerRadius} ${innerRadius} 0 1 1 ${rAnchor.x} ${-rAnchor.y}`} 
					strokeWidth={radius / 10} 
					className="pie-background"
					/>
				<path d={`M ${lAnchor.x} ${-lAnchor.y} A ${innerRadius} ${innerRadius} 0 ${value > 0.5 ? 1 : 0} 1 ${valueCoords.x} ${-valueCoords.y}`}
					strokeWidth={radius / 10 - 5} 
					className="pie-foreground"
					/>
				<circle cx={valueCoords.x} cy={-valueCoords.y} r={5} className="dot"/>
				<text className="label">
					{label}
				</text>
			</g>
		</svg>
	);
}
