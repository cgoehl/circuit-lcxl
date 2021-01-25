import React from 'react';
import { connect } from 'react-redux';
import { IAppState } from '../state/store';
import { GridContainer } from './GridComponent';
import { MatrixContainer } from './MatrixComponent';
import './LayoutComponent.scss';
import { UiView } from '../../shared/UiDtos';

const getComponent = (activeView: UiView) => {
	switch (activeView) {
		case 'synthParams': return GridContainer;
		case 'synthMatrixCombo': return GridContainer;
		case 'synthMatrix': return MatrixContainer;
		default: return () => <div>Unknown view: {activeView}</div>
	}
}

function LayoutComponent(props: {
	activeView: UiView,
	activeSynth: number,
}) {
	return ( 
	<div className={`active-synth-${props.activeSynth}`} >
		{React.createElement(getComponent(props.activeView))}
	</div>
	);
}

export const LayoutContainer = connect((state: IAppState) => {
	const { ui: { state: { activeView, activeSynth }}} = state;
	return { activeView, activeSynth }
})(LayoutComponent);