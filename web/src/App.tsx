import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { MqttClient } from './mqtt/MqttClient';
import { useState, State } from '@hookstate/core';
import { KnobComponent } from './controls/KnobComponent';
import { range } from './utils';

interface IAppState {
	text: string;
}

function App() {
	const state: State<IAppState> = useState({ text: '' });
	return (
		<div className="App">
			<MqttClient topics={['+/#']} onMessage={(m, t) => state.set(s => ({ text: `${t}\t${m}\n${s.text}`}))} />
			<div>
				{range(11).map(i => <KnobComponent key={i} value={i * 0.1} label={i.toString()}/>)}
			</div>
			<div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
				{state.get().text }
			</div>
		</div>
	);
}

export default App;
