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
		broker.sub(`${this.topicPrefix}/command/+/#`, this.handleCommand);
	}

	protected abstract commandReceived(command: string[], payload: object): void;

	protected raiseEvent(path: string[], payload: IEvent) {
		broker.pub(
			`${this.topicPrefix}/event/${path.join('/')}`,
			payload
		);
	}

	private handleCommand = (payload: object, topic: string) => {
		const command = topic.replace(`${this.topicPrefix}/command/`, '').split('/');
		this.commandReceived(command, payload as ICommand);
	};

	protected onClose(callback: () => void) {
		this.onCloseCallbacks.push(callback);
		const { input, output } = this.midi;
		input?.close();
		output?.close();
	}
	private onCloseCallbacks: Array<(() => void)> = [];
	close(): void {
		this.onCloseCallbacks.forEach(c => c());
		this.onCloseCallbacks = null;
	}
}
