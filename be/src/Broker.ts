import  { Aedes, AedesPublishPacket, PublishPacket, Server } from 'aedes';
import { createServer } from 'net';
import { createServer as createHttpServer } from 'http';
import { createServer as createWsServer } from 'websocket-stream';


export interface IBroker {
	pub(topic: string, payload: object): Promise<void>;
	sub(topic: string, onMessage: (payload: object, topic: string) => void): Promise<void>
	unsub(topic: string, onMessage: (payload: object, topic: string) => void): Promise<void>
} 

export async function startBroker(): Promise<IBroker> {
	const aedes = Server() as Aedes & IBroker;
	const port = 1883;
	const callbacks = new Map<(payload: object, topic: string) => void, (packet: AedesPublishPacket, callback: () => void) => void>()

	const jsonParse = (text: string): object => {
		try {
			return JSON.parse(text);
		} catch (e) {
			return { __raw: text };
		}
	}

	aedes.sub = (topic: string, onMessage: (payload: object, topic: string) => void): Promise<void> => {
		return new Promise((resolve, reject) => {
			const callback = (packet, cb) => { cb(); onMessage(jsonParse(packet.payload.toString()), packet.topic); };
			callbacks.set(onMessage, callback);
			aedes.subscribe(topic, callback, resolve);
		})
	};

	aedes.unsub = (topic: string, onMessage: (payload: object, topic: string) => void): Promise<void> => {
		return new Promise((resolve, reject) => {
			aedes.unsubscribe(topic, callbacks.get(onMessage), resolve);
		});
	}

	aedes.pub = (topic: string, payload: object): Promise<void> => {
		return new Promise((resolve, reject) => {
			aedes.publish({ cmd: 'publish', dup: false, retain: false, qos: 0, topic, payload: JSON.stringify(payload) }, err => err ? reject(err) : resolve());
		});
	}

	// return new Promise((resolve, reject) => {
	// 	createServer(aedes.handle).listen(port, () => {
	// 		broker.pub = aedes.pub;
	// 		broker.sub = aedes.sub;
	// 		broker.unsub = aedes.unsub;
	// 		resolve(aedes);
	// 	});
	// });

	return new Promise((resolve, reject) => {
		createServer(aedes.handle).listen(port, () => {
			const httpServer = createHttpServer();
			createWsServer({ server: httpServer }, aedes.handle as any);
			httpServer.listen(8080, () => {
				broker.pub = aedes.pub;
				broker.sub = aedes.sub;
				broker.unsub = aedes.unsub;
				resolve(aedes);
			});
		});
	});
}

export const broker: IBroker = {
	pub: null,
	sub: null,
	unsub: null,
}