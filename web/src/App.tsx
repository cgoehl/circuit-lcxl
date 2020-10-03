import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { MqttClient } from './mqtt/MqttClient';
import { useState, State } from '@hookstate/core';

interface IAppState {
	text: string;
}

function App() {
	const state: State<IAppState> = useState({ text: '' });
	return (
		<div className="App">
			<MqttClient topics={['+/#']} onMessage={(m, t) => state.set(s => ({ text: `${t}\t${m}\n${s.text}`}))} />
			<div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
				{state.get().text }
			</div>
		</div>
	);
}

export default App;
