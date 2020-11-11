import { MidiParameter } from "../../shared/MidiParameter";
import { UiState } from "../../shared/UiDtos";
import { IPoint2, range } from "../../shared/utils";
import { IBroker } from "../Broker";
import { Lcxl } from "../NovationLcxl";
import { Button, Knob } from "../PhysicalControl";
import { CircuitVirtualController } from "./WebController";


export class PhysicalVirtualAdapter {

	constructor(
		readonly lcxl: Lcxl,
		readonly virtual: CircuitVirtualController,
		readonly broker: IBroker
	) { }

	start = async () => {
		const { broker, lcxl, virtual } = this;
		lcxl.clearLeds();
		await broker.sub(`${lcxl.topicPrefix}/event/button/direction/#`, (payload: Button) => {
			const { location: { index }, isPressed } = payload;
			if (!isPressed) { return; }
			virtual.updateState(state => ({
				...state,
				controllerPage: index,
				controllerAnchor: this.pageToAnchor(index),
			}));
		});
		await broker.sub(`${lcxl.topicPrefix}/event/knob/grid/#`, (payload: Knob) => {
			const { location: { col, row }, value } = payload;
			virtual.handleControlChange(col, row, value);
		});
		virtual.on('changed', this.handleUiStateChange);
	};
	
	handleUiStateChange = (state: UiState) => {
		const { controllerPage } = state;
		range(4).forEach(i => {
			this.lcxl.setDirectionLed(i, i === controllerPage ? 'redH' : 'off');
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
	// applyUiParamChange = (midiParam: MidiParameter, value: number) => {
	// 	//todo: direct access to HW
	// 	this.virtual.circuit.setMidiParam(0, midiParam, value);
	// };

	// setPage = (index: number) => {
	// 	switch (index) {
	// 		case 0: this.controllerAnchor = ({ x: 0, y: 0 });
	// 			break;
	// 		case 1: this.controllerAnchor = ({ x: 8, y: 0 });
	// 			break;
	// 		case 2: this.controllerAnchor = ({ x: 0, y: 4 });
	// 			break;
	// 		case 3: this.controllerAnchor = ({ x: 8, y: 4 });
	// 			break;
	// 	}
		
	// 	this.broker.pub(`web/ui/controller`, this.controllerAnchor);
	// }

}
