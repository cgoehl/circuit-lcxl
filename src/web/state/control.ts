
import { connect as mqttConnect, MqttClient as Mqtt} from 'mqtt';
import { patchUpdate, store, updateAction } from './store';


class MqttController {
	
	private topicPrefix: string;
	
	constructor(
		readonly client: Mqtt,
	) {	
		this.topicPrefix = `web`;
	}


	handleMessage = async (topic: string, payload: any) => {
		const { dispatch } = store;
		console.log(topic, payload);
		switch (topic) {
			case 'web/ui/layout/knobs':
				dispatch(updateAction(state => (state.ui.layout.knobs = payload)));
				break;
			case 'web/ui/layout/mod-matrix':
				dispatch(updateAction(state => (state.ui.layout.matrix = payload)));
				break;
			case 'web/ui/state':
				dispatch(updateAction(state => (state.ui.state = payload)));
				break;
			case 'web/circuit/patch':
				const { patch, synthNumber } = payload;
				dispatch(patchUpdate(patch, synthNumber));
				break;
		}
	}

	start = async () => {
		this.client.on('connect', () => {
			this.publish('hello', { });
			store.dispatch(updateAction(state => (state.isConnected = true)));
			this.client.subscribe(`web/#`);
		});
		this.client.on('error', e => console.error(e));
		this.client.on('message', (topic: string, payload: Buffer) => {
			this.handleMessage(topic, JSON.parse(payload.toString()));
		})
	}

	publish = (topic: string, obj: object) => new Promise<void>((resolve, reject) => {
		this.client.publish(
			`${this.topicPrefix}/${topic}`,
			JSON.stringify(obj),
			err => err ? reject(err) : resolve()
			);
	});
}

export async function startMqttController() {
	const client = mqttConnect('ws://localhost:8080');
	const controller = new MqttController(client);
	await controller.start();
}
