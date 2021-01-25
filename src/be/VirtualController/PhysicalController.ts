import { UiState } from "../../shared/UiDtos";
import { range } from "../../shared/utils";
import { Lcxl, LcxlGridColor, LcxlSideColor } from "../NovationLcxl";
import { Button } from "../PhysicalControl";
import { Action, CircuitVirtualController } from "./CircuitVirtualController";

class LedGroupState<TColor> {
	
	public readonly currentColor: TColor[] = [];

	constructor(
		public readonly count,
		public readonly initialColor: TColor,
		public readonly updateFunc: (index: number, color: TColor) => void,
	) {
		this.reset();
	}

	reset = () => range(this.count).forEach(index => {
		this.currentColor[index] = this.initialColor;
		this.updateFunc(index, this.initialColor);
	});

	apply = (color: TColor, index: number) => {
		if (index < 0 || index >= this.count) { throw new Error(`Out of range: ${index}`); }
		if (color !== this.currentColor[index]) { this.updateFunc(index, color);	}
		this.currentColor[index] = color;
	}
}

export class PhysicalVirtualAdapter {

	readonly gridLeds = new LedGroupState<LcxlGridColor>(40, 'off', this.lcxl.setGridLed);
	readonly sideLeds = new LedGroupState<LcxlSideColor>(4, 'off', this.lcxl.setSideLed);
	readonly directionLeds = new LedGroupState<boolean>(4, false, this.lcxl.setDirectionLed);

	constructor(
		readonly lcxl: Lcxl,
		readonly virtual: CircuitVirtualController,
	) { 
	}

	start = async () => {
		const {  lcxl, virtual } = this;
		lcxl.on('directionButton', button => this.handleActionButton(button, virtual.directionActions, 0))
		lcxl.on('sideButton', button => this.handleActionButton(button, virtual.sideActions, 0));
		lcxl.on('gridButton', button => this.handleActionButton(button, virtual.getBottomActions(), 8));
		lcxl.on('knob', knob => {
			const { location: { col, row }, value } = knob;
			virtual.handleControlChange(col, row, value);
		})
		virtual.on('changed', this.handleUiStateChange);
		this.handleUiStateChange(virtual.state);
	};

	handleActionButton = <TColor>(button: Button, actions: Action<TColor>[], offset: number) => {
		const { isPressed, location: { index }} = button;
		const action = actions.find(a => a.index + offset === index);
		if (!action) return;
		if (isPressed && action.onPress) { action.onPress(); }
		if (!isPressed && action.onRelease) { action.onRelease(); }
	}
	
	handleUiStateChange = (state: UiState) => {
		this.virtual.getSideLeds().forEach(this.sideLeds.apply);
		this.virtual.getGridLeds().forEach(this.gridLeds.apply);
		this.virtual.getDirectionLeds().forEach(this.directionLeds.apply);
	}
}
