import  { Aedes, AedesPublishPacket, PublishPacket, Server } from 'aedes';
import { createServer } from 'net';


export interface IBroker {
	pub(topic: string, payload: string): Promise<void>;
	sub(topic: string, onMessage: (payload: string, topic: string) => void): Promise<void>
	unsub(topic: string, onMessage: (payload: string, topic: string) => void): Promise<void>
} 

export async function startBroker(): Promise<IBroker> {
	const server = Server() as Aedes & IBroker;
	const port = 1883;
	const callbacks = new Map<(payload: string, topic: string) => void, (packet: AedesPublishPacket, callback: () => void) => void>()

	server.sub = (topic: string, onMessage: (payload: string, topic: string) => void): Promise<void> => {
		return new Promise((resolve, reject) => {
			const callback = (packet, cb) => { onMessage(packet.payload.toString(), packet.topic); cb(); };
			callbacks.set(onMessage, callback);
			server.subscribe(topic, callback, resolve);
		})
	};

	server.unsub =(topic: string, onMessage: (payload: string, topic: string) => void): Promise<void> => {
		return new Promise((resolve, reject) => {
			server.unsubscribe(topic, callbacks.get(onMessage), resolve);
		});
	}

	server.pub = (topic: string, payload: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			server.publish({ cmd: 'publish', dup: false, retain: false, qos: 0, topic, payload }, err => err ? reject(err) : resolve());
		});
	}

	return new Promise((resolve, reject) => {
		createServer(server.handle).listen(port, () => {
			broker.pub = server.pub;
			broker.sub = server.sub;
			resolve(server);
		});
	});
}

export const broker: IBroker = {
	pub: null,
	sub: null,
}