import { UiModMatrix } from "../../shared/UiDtos";
import { LcxlGridColor } from "../NovationLcxl";
import { Action, CircuitVirtualController } from "./CircuitVirtualController";
import { UiLayout } from "./UiLayout";
import { VirtualMode } from "./VirtualMode";


export class SynthMatrixComboMode extends VirtualMode {

	public readonly bottomActions: Action<LcxlGridColor>[] = [];
	

	constructor (
		controller: CircuitVirtualController,
		private readonly knobUi: UiLayout,
		private readonly modMatrixUi: UiModMatrix,
	) {
		super(controller, 'synthMatrixCombo');
	}

	protected getKnobLeds = (): LcxlGridColor[] => {
		const { state: { controllerAnchor }, controllerSize } = this.controller;
		const controllerGrid = this.knobUi.subGrid(controllerAnchor, controllerSize);
			return controllerGrid.items
				.map(param => param && param.modDestination !== null ? 'amberH' : 'off');
	}

	public handleControlChange = (col: number, row: number, value: number): void => {
		const { state: { controllerAnchor: { x, y }, activeSynth }, circuit, updateState } = this.controller;

			if (value == null) { return; }
			const absVKnob = { x: col + x, y: row + y };
			const uiParam = this.knobUi.getAt(absVKnob);
			const { modDestination } = uiParam;
			if (modDestination === null ) { return; }
			const { slots } = this.modMatrixUi;
			let activeSlot = slots.find( slot => {
				const activeDestination = circuit.getPatch(activeSynth).bytes[slot.destinationAddress];
				return activeDestination === modDestination;
			});
			if (!activeSlot) {
				activeSlot = slots.find( (slot, i) => {
					console.log('findslot', i, circuit.getPatch(activeSynth).bytes[slot.destinationAddress]); 
					return circuit.getPatch(activeSynth).bytes[slot.destinationAddress] === 0;
				});
				if (!activeSlot) { return; }
				const param = circuit.parametersByAddress[activeSlot.destinationAddress];
				circuit.setMidiParamAbsolute(activeSynth, param, modDestination);
			}
			updateState(state => ({ ...state, modMatrix: { slot: activeSlot.slotNumber - 1 }, activeView: 'synthMatrix' }));
	}
}