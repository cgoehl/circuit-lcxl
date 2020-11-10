
import { connect as mqttConnect, MqttClient as Mqtt} from 'mqtt';
import { store } from './store';

class MqttController {
	
	private topicPrefix: string;
	
	constructor(
		readonly client: Mqtt,
	) {	
		this.topicPrefix = `web`;
	}

	handleMessage = async (topic: string, payload: any) => {
		if (/web\/ui\/layout\/knobs/.test(topic)) {
			store.ui.layout.knobs.set(payload);
		} else if (/web\/ui\/layout\/mod-matrix/.test(topic)) {
			store.ui.layout.matrix.set(payload);
		} else if (/web\/ui\/controller/.test(topic)) {
			store.ui.controller.set(payload);
		} else if (/phy\/novation\/circuit\/\d+\/event\/patch/.test(topic)) {
			const { patch, synthNumber } = payload;
			synthNumber === 0
				? store.circuit.patch0.set(patch)
				: store.circuit.patch1.set(patch)
		}
		// console.log(JSON.stringify(store.get(), null, 2));
	}

	start = async () => {
		this.client.on('connect', () => {
			this.publish('hello', { });
			store.merge({ isMqttConnected: true });
			this.client.subscribe(`phy/#`);
			this.client.subscribe(`web/#`);
		});
		this.client.on('error', e => console.error(e));
		this.client.on('message', (topic: string, payload: Buffer) => {
			this.handleMessage(topic, JSON.parse(payload.toString()));
		})
	}

	publish = (topic: string, obj: object) => new Promise((resolve, reject) => {
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
