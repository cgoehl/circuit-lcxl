import React, { Component } from 'react';
import { connect as mqttConnect } from 'mqtt';


export interface MqttClientProps {
	topics: string[],
	onMessage: (message: String, topic: String) => void,
}

export class MqttClient extends Component<MqttClientProps> {

	componentDidMount = () => {
		const { topics, onMessage } = this.props;
		
		const client = mqttConnect('ws://localhost:8080');
		client.on('connect', function () {
			topics.forEach(topic => client.subscribe(topic));
		})

		client.on('message', function (topic, message) {
			onMessage(message.toString(), topic);
			client.end()
		})
	}
	
	render() {
		return null;
	}
}

