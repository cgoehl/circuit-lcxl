
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
		if (/phy\/novation\/circuit\/\d+\/event\/params/.test(topic)) {
			store.circuit.params.set(payload.parameters);
		} else if (/phy\/novation\/circuit\/\d+\/event\/patch/.test(topic)) {
			const { patch, synthNumber } = payload;
			synthNumber === 0
				? store.circuit.patch0.set(patch)
				: store.circuit.patch1.set(patch)
		} else if (/phy\/novation\/lcxl\/\d+\/event\/knob\/grid/.test(topic)) {
			const { location: { index }, value } = payload;
			store.lcxl.knobs.merge(k => ({ [index]: value }));
		} else if (/phy\/novation\/lcxl\/\d+\/event\/button\/grid/.test(topic)) {
			const { location: { index }, value } = payload;
			store.lcxl.buttons.merge(k => ({ [index]: value }));
		} else {
			// console.warn('unsupported topic:', topic);
		}
	}

	start = async () => {
		this.client.on('connect', () => {
			this.publish('hello', { });
			store.merge({ isMqttConnected: true });
			this.client.subscribe(`phy/#`);
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

// export function start() {
			
// 	const client = mqttConnect('ws://localhost:8080');
// 	// const state = store.get();
// 	// const topicPrefix = `web/${state.id}`;
// 	const publish = (topic: string, obj: object) => 
// 		client.publish(`${topicPrefix}/topic`, )

// 	// client.on('connect', function () {
// 	// 	client.publish(`web/`)
// 	// })

// 	// client.on('message', function (topic, message) {
// 	// 	onMessage(message.toString(), topic);
// 	// 	onConnect();
// 	// })

	
// }