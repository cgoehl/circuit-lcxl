import { stat } from "fs";
import { MidiParameter } from "../../shared/MidiParameter";
import { UiState } from "../../shared/UiDtos";
import { IPoint2, range } from "../../shared/utils";
import { Lcxl } from "../NovationLcxl";
import { Button, Knob } from "../PhysicalControl";
import { CircuitVirtualController } from "./WebController";


export class PhysicalVirtualAdapter {

	constructor(
		readonly lcxl: Lcxl,
		readonly virtual: CircuitVirtualController,
	) { }

	start = async () => {
		const {  lcxl, virtual } = this;
		lcxl.clearLeds();
		lcxl.on('directionButton', button => {
			const { location: { index }, isPressed } = button;
			if (!isPressed) { return; }
			virtual.updateState(state => ({
				...state,
				controllerPage: index,
				controllerAnchor: this.pageToAnchor(index),
			}));
		})
		lcxl.on('sideButton', button => {
			const { location: { index }, isPressed } = button;
			if (!isPressed || index !== 3) { return; }
			virtual.updateState(state => {
				const { modMatrix: { isOpen, slot}} = state;
				return {
					...state,
					modMatrix: { isOpen: !isOpen, slot },
			}});
		});
		lcxl.on('knob', knob => {
			const { location: { col, row }, value } = knob;
			virtual.handleControlChange(col, row, value);
		})
		virtual.on('changed', this.handleUiStateChange);
	};
	
	handleUiStateChange = (state: UiState) => {
		const { controllerPage, modMatrix: { isOpen } } = state;
		range(4).forEach(i => {
			this.lcxl.setDirectionLed(i, i === controllerPage ? 'redH' : 'off');
		});
		range(4).forEach(i => {
			this.lcxl.setSideLed(i, (i === 3) && isOpen ? 'amberH' : 'off');
			// this.lcxl.setSideLed(i, 'redH');
		});
	}

	pageToAnchor = (page: number): IPoint2 => {
		switch (page) {
			case 0: return ({ x: 0, y: 0 });
			case 1: return ({ x: 8, y: 0 });
			case 2: return ({ x: 0, y: 4 });
			case 3: return ({ x: 8, y: 4 });
		}
	};
}
