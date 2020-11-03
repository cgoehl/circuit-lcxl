import React, { useEffect } from 'react';
import './App.scss';
import { useState } from '@hookstate/core';
import { store } from './state/store';
import { startMqttController } from './state/control';
import { LayoutComponent } from './controls/LayoutComponent';

interface IAppState {
	text: string;
}

function App() {
	useEffect(() => {
		startMqttController();
	}, []);
	const state = useState(store);
	const isConnected = state.isMqttConnected.get();
	const ui = state.ui.get();
	return (
		<div className="App">
			{/* <div>
				{range(127).map(i => i / 127).map(i => <KnobComponent key={i} value={i}  label={i.toFixed(3)}/>)}
			</div> */}
			{ isConnected && ui.layout
				? <LayoutComponent circuitState={state.circuit} layout={ui.layout} controllerAnchor={ui.controller || {x: 0, y: 0}} />
				: 'Waiting for layout...' }
		</div>
	);
}

export default App;
