import { MidiParameter } from "../MidiParameter";
import { asciiToString } from "../../shared/utils";
import { circuitSysex } from "./ciruitSysex";


export class Patch {

	name: string;
	category: number;
	genre: number;

	constructor(
		public readonly parameters: MidiParameter[],
		public readonly patch: number[]
	) {
		this.name = asciiToString(patch.slice(0, 16));
		this.category = patch[16];
		this.genre = patch[17];
	}
}