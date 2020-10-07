import React, { useEffect } from 'react';
import { IVirtualControlButton, IVirtualControlItem, IVirtualControlKnob, IVirtualControlSection } from '../../shared/VirtualControl';
import { KnobComponent } from './KnobComponent';

import './VirtualControlComponents.scss';


interface IVirtualKnobComponentProps {
	item: IVirtualControlKnob,
}

function VirtualKnobComponent(props: IVirtualKnobComponentProps) {
	const { item: { id } } = props;
	return (
		<button className='_knob' >
			<KnobComponent label={id} value={0} />
		</button>
	);
}


interface IVirtualButtonComponentProps {
	item: IVirtualControlButton,
}

function VirtualButtonComponent(props: IVirtualButtonComponentProps) {
	const { item: { id } } = props;
	return (
		<button className='_button' >
			{id}
		</button>
	);
}

interface IVirtualSectionComponentProps {
	item: IVirtualControlSection,
}

function VirtualSectionComponent(props: IVirtualSectionComponentProps) {
	const { item: { id, items } } = props;
	return (
		<div className='_section'>
			<div className='_id'>{id}</div>
			<div className='_items'>
				{items.map(item => {
					return (
						<div className='_item'>
							<SelectVirtualComponent item={item} />
						</div>
					);
				})}
			</div>
		</div>
	);
}

interface ISelectComponentProps {
	item: IVirtualControlItem,
}

function SelectVirtualComponent(props: ISelectComponentProps) {
	const { item: { type } } = props;
	switch (type) {
		case 'section':
			return (<VirtualSectionComponent item={props.item as IVirtualControlSection} />)
		case 'knob':
			return (<VirtualKnobComponent item={props.item as IVirtualControlKnob} />)
		case 'button':
			return (<VirtualButtonComponent item={props.item as IVirtualControlButton} />)
		default:
			return (<div>{`Unsupported type: ${type}.`}</div>)
	}
}

export interface VirtualControlRootProps {
	section: IVirtualControlSection,
}
export function VirtualControlRoot(props: VirtualControlRootProps) {
	const { section } = props;
	return (
		<div className='virtual-control-root'>
			<VirtualSectionComponent item={section} />
		</div>
	);
}


