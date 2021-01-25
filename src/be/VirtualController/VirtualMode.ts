import { UiView } from "../../shared/UiDtos";
import { range } from "../../shared/utils";
import { LcxlGridColor } from "../NovationLcxl";
import { Action, CircuitVirtualController } from "./CircuitVirtualController";


export abstract class VirtualMode {

	public bottomActions: Action<LcxlGridColor>[] = [];

	constructor (
		readonly controller: CircuitVirtualController,
		readonly view: UiView,
	) {}

	protected abstract getKnobLeds(): LcxlGridColor[];

	public getGridLeds = (): LcxlGridColor[] => {
		const knobLeds = this.getKnobLeds();
		if (knobLeds.length !== 32) { throw new Error('Must have exactly 32 knob leds'); }
		const buttonColors = range(8).map(index => {
			const action = this.bottomActions.find(action => action.index === index);
			return action ? action.color() : 'off';
		})
		return knobLeds.concat(buttonColors);
	}

	public abstract handleControlChange(col: number, row: number, value: number): void;
}