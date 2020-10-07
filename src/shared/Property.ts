import { EventEmitter } from "tsee";



export class Property<T> extends EventEmitter<{
	changed: (newValue: T, oldValue: T) => void,
}> {
	private value: T;

	constructor(readonly initialValue: T) {
		super();
		this.value = initialValue;
	}

	set = (value: T) => {
		const old = this.value;
		this.value = value;
		this.emit('changed', value, old);
	}

	get = (): T => {
		return this.value;
	}
}