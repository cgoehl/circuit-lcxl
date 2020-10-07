
import { connect as mqttConnect, MqttClient as Mqtt} from 'mqtt';
import { store } from './store';

class MqttController {
	
	private topicPrefix: string;
	
	constructor(
		readonly client: Mqtt,
	) {	
		this.topicPrefix = `web`;
	}

	handleMessage = async (topic: string[], payload: any) => {
		const [ cmd ] = topic;
		switch(cmd) {
			case 'layout':
				console.log('received root-section:', payload);
				store.merge({ rootSection: payload });
				break;
			case 'vc':
				const id = ['web', ...topic].join('/');
				console.log(id);
				// console.log({ controls: { [id]: payload }})
				store.merge(p => ({ controls: { [id]: payload }}));
				
				break;
			default:
				console.warn('unsupported command', cmd);
		}
	}

	start = async () => {
		this.client.on('connect', () => {
			this.publish('hello', { });
			store.merge({ isMqttConnected: true });
			this.client.subscribe(`${this.topicPrefix}/#`);
		});
		this.client.on('error', e => console.error(e));
		this.client.on('message', (topic: string, payload: Buffer) => {
			this.handleMessage(topic.replace(`${this.topicPrefix}/`, '').split('/'), JSON.parse(payload.toString()));
		})
	}

	publish = (topic: string, obj: object) => new Promise((resolve, reject) => {
		this.client.publish(
			`${this.topicPrefix}/${topic}`,
			JSON.stringify(obj),
			err => err ? reject(err) : reject()
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