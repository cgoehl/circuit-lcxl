import React, { useEffect } from 'react';
import './App.scss';
import { useState } from '@hookstate/core';
import { store } from './state/store';
import { startMqttController } from './state/control';
import { CircuitComponent } from './ciruit';
import { range } from '../shared/utils';
import { KnobComponent } from './controls/KnobComponent';
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
				{range(127).map(i => i / 127).map(i => <KnobComponent key={i} value={i}  label={i.toFixed(3)}/>)}
			</div> */}
			{ isConnected 
				? <CircuitComponent circuitState={state.circuit} />
				: 'Waiting for layout...' }
		</div>
	);
}

export default App;
