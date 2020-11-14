import React, { useEffect } from 'react';
import { IAppState } from './state/store';
import { connect } from 'react-redux';
import { LayoutContainer } from './controls/Layout';

import './App.scss';
import { startMqttController } from './state/control';

function App_(props: {
	isReady: boolean
}) {
	useEffect(() => {
		startMqttController();
	}, []);
	return props.isReady
		? <LayoutContainer />
		: <div>Loading...</div>
}

export const App = connect((state: IAppState) => {
	const { isReady } = state;
	return { isReady }
})(App_);
