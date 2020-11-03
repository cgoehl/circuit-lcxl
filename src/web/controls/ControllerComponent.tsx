import { State } from '@hookstate/core';
import React from 'react';
import { IPoint2 } from '../../shared/utils';

import './LayoutComponent.scss';


export function ControllerComponent(props: {
	anchor: IPoint2
}) {
	const { anchor: { x, y } } = props;
	console.log({ x, y });
	return (
		<div style={{ gridArea: `${y + 1} / ${x + 1} / ${y + 5} / ${x + 9}`}} className='_controller'/>			
	);
}
