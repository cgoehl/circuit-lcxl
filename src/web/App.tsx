import React, { useEffect } from 'react';
import './App.scss';
import { State, useState } from '@hookstate/core';
import { ICircuitState, store } from './state/store';
import { startMqttController } from './state/control';
import { LayoutComponent } from './controls/LayoutComponent';
import { UiState } from '../shared/UiDtos';

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
	// ToDo: need this to force delay render. Get rid of those hacks. just switch to redux?
	console.log(state.circuit.patch0.bytes.length)
	return (
		<div className="App">
			{/* <div>
				{range(127).map(i => i / 127).map(i => <KnobComponent key={i} value={i}  label={i.toFixed(3)}/>)}
			</div> */}
			
			{ isConnected && ui.layout.knobs && ui.layout.matrix && ui.state && state.circuit.patch0.bytes.length
				? <LayoutComponent circuitState={state.circuit} layout={ui.layout} state={ui.state as UiState} />
				: 'Waiting for layout...' }
		</div>
	);
}

export default App;
