import React from 'react';
import { connect } from 'react-redux';
import { IAppState } from '../state/store';
import { GridContainer } from './GridComponent';
import { MatrixContainer } from './MatrixComponent';
import './LayoutComponent.scss';

function LayoutComponent(props: {
	isOpen: boolean
}) {
	return props.isOpen
		? <MatrixContainer />
		: <GridContainer />
}

export const LayoutContainer = connect((state: IAppState) => {
	const { ui: { state: { modMatrix: { mode }}}} = state;
	return { isOpen: mode === 'open' }
})(LayoutComponent);