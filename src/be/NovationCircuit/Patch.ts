import { MidiParameter } from "../MidiParameter";
import { arrayToObject, asciiToString } from "../../shared/utils";
import { circuitSysex } from "./ciruitSysex";
import { IVirtualControlItem, IVirtualControlSection } from "../../shared/VirtualControl";


export class CircuitPatch {

	name: string;
	category: number;
	genre: number;

	virtualLayout: IVirtualControlSection;

	public parametersByName: {[name: string]: MidiParameter} = null;
	public parametersByAddress: {[address: string]: MidiParameter} = null;

	constructor(
		public readonly parameters: MidiParameter[],
		public readonly bytes: number[]
	) {
		this.name = asciiToString(bytes.slice(0, 16));
		this.category = bytes[16];
		this.genre = bytes[17];
		this.parametersByName = arrayToObject(parameters, p => p.name);
		this.parametersByAddress = arrayToObject(parameters, p => p.sysexAddress.toString());
	}
}