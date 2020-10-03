import { ICloseable } from "./ICloseable";
import { broker } from './Broker';
import { Input, Output } from "easymidi";


export interface IDeviceDescriptor {
	vendor: string,
	model: string,
	instance: string,
}

export interface IMidiIO {
	input: Input,
	output: Output,
}

export interface ICommand {

}

export interface IEvent {

}


export abstract class BaseDevice implements ICloseable {

	public topicPrefix = '';

	constructor(
		public readonly descriptor: IDeviceDescriptor,
		public readonly midi: IMidiIO
	) {
		const { vendor, model, instance } = descriptor;
		this.topicPrefix = `phy/${vendor}/${model}/${instance}`;
	}

	protected async registerCommand(topic: string, callback: (payload: ICommand, topic: string[]) => void) {
		const t = `${this.topicPrefix}/command/${topic}`;
		const c = (payload, tc) => callback(payload as ICommand, tc.replace(`${this.topicPrefix}/command/`, '').split('/'));
		await broker.sub(t, c);
		this.onClose(async () => await broker.unsub(t, c));
	}

	protected raiseEvent(path: string[], payload: IEvent) {
		broker.pub(
			`${this.topicPrefix}/event/${path.join('/')}`,
			payload
		);
	}

	protected onClose(callback: () => void) {
		this.onCloseCallbacks.push(callback);
	}
	private onCloseCallbacks: Array<(() => void)> = [];
	close(): void {
		this.onCloseCallbacks.forEach(c => c());
		this.onCloseCallbacks = null;
		const { input, output } = this.midi;
		input?.close();
		output?.close();
	}
}
