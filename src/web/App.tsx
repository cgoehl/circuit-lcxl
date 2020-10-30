import React, { useEffect } from 'react';
import './App.scss';
import { useState } from '@hookstate/core';
import { store } from './state/store';
import { startMqttController } from './state/control';
import { CircuitComponent } from './ciruit';
// import { VirtualControlRoot } from './controls/VirtualControlComponents';

interface IAppState {
	text: string;
}

function App() {
	useEffect(() => {
		startMqttController();
	}, []);
	const state = useState(store);
	const isConnected = state.isMqttConnected.get();
	return (
		<div className="App">
			{/* <div>
				{range(11).map(i => <KnobComponent key={i} value={i * 0.1} label={i.toString()}/>)}
			</div> */}
			{ isConnected 
				? <CircuitComponent circuitState={state.circuit} />
				: 'Waiting for layout...' }
		</div>
	);
}

export default App;
