import React from 'react';
import { connect } from 'react-redux';
import { IAppState } from '../state/store';
import { GridContainer } from './GridComponent';
import { MatrixContainer } from './MatrixComponent';
import './LayoutComponent.scss';

function LayoutComponent(props: {
	isOpen: boolean,
	activeSynth: number,
}) {
	return ( 
	<div className={`active-synth-${props.activeSynth}`} >
		{ props.isOpen
		? <MatrixContainer />
		: <GridContainer /> }
	</div>
	);
}

export const LayoutContainer = connect((state: IAppState) => {
	const { ui: { state: { modMatrix: { mode }, activeSynth }}} = state;
	return { isOpen: mode === 'open', activeSynth }
})(LayoutComponent);