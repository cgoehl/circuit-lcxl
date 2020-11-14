import React from 'react';
import { connect } from 'react-redux';
import { IPoint2 } from '../../shared/utils';
import { IAppState } from '../state/store';

import './LayoutComponent.scss';


export function ControllerAnchorComponent(props: {
	controllerAnchor: IPoint2
}) {
	const { controllerAnchor: { x, y } } = props;
	console.log({ x, y });
	return (
		<div style={{ gridArea: `${y + 1} / ${x + 1} / ${y + 5} / ${x + 9}`}} className='_controller'/>			
	);
}

export const ControllerAnchorContainer = connect((state: IAppState) => {
	const { ui: { state: { controllerAnchor }}} = state;
	return { controllerAnchor }
})(ControllerAnchorComponent);