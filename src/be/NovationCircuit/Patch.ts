import { asciiToString } from "../../shared/utils";


export class CircuitPatch {

	name: string;
	category: number;
	genre: number;

	constructor(
		public readonly bytes: number[]
	) {
		this.name = asciiToString(bytes.slice(0, 16));
		this.category = bytes[16];
		this.genre = bytes[17];
	}
}