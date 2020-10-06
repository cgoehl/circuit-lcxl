import React, { useEffect } from 'react';
import { connect as mqttConnect, MqttClient as Mqtt} from 'mqtt';
import { useState } from '@hookstate/core';


export interface IMqttClientProps {
	topics: string[],
	onMessage: (message: String, topic: String) => void,
	onConnect: () => void,
}

export function MqttClient(props : IMqttClientProps) {

	const state = useState<Mqtt | null>(null);
	useEffect(() => {
		if (state.get() == null) {
			const { topics, onMessage, onConnect } = props;
			
			const client = mqttConnect('ws://localhost:8080');
			client.on('connect', function () {
				topics.forEach(topic => client.subscribe(topic));
			})

			client.on('message', function (topic, message) {
				onMessage(message.toString(), topic);
				onConnect();
			})

			state.set(client);
		}
		
	})
	return null;
}

