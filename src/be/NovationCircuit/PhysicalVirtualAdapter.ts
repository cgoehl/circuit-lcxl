import { MidiParameter } from "../../shared/MidiParameter";
import { IPoint2 } from "../../shared/utils";
import { IBroker } from "../Broker";
import { Lcxl } from "../NovationLcxl";
import { Button, Knob } from "../PhysicalControl";
import { CircuitVirtualController } from "./CircuitVirtualController";


export class PhysicalVirtualAdapter {

	private controllerAnchor: IPoint2 = { x: 0, y: 0 };

	constructor(
		readonly lcxl: Lcxl,
		readonly virtual: CircuitVirtualController,
		readonly broker: IBroker
	) { }

	start = async () => {
		const { broker, lcxl, virtual } = this;
		lcxl.clearLeds();
		await broker.sub(`web/hello`, async (payload: any) => {
			this.setControllerAnchor(this.controllerAnchor);
		});
		await broker.sub(`${lcxl.topicPrefix}/event/button/direction/#`, (payload: Button) => {
			const { location: { index }, isPressed } = payload;
			if (!isPressed) { return; }
			switch (index) {
				case 0: this.setControllerAnchor({ x: 0, y: 0 });
					break;
				case 1: this.setControllerAnchor({ x: 8, y: 0 });
					break;
				case 2: this.setControllerAnchor({ x: 0, y: 4 });
					break;
				case 3: this.setControllerAnchor({ x: 8, y: 4 });
					break;
			}
		});
		await broker.sub(`${lcxl.topicPrefix}/event/knob/grid/#`, (payload: Knob) => {
			const { location: { col, row }, value } = payload;
			const { x, y } = this.controllerAnchor;
			if (value == null) { return; }
			const absVKnob = { x: col + x, y: row + y };
			console.log(absVKnob);
			const uiParam = virtual.layout.getAt(absVKnob);
			if (!uiParam) { return; }
			const midiParam = virtual.circuit.parametersByAddress[uiParam.address];
			if (!midiParam) { return; }
			this.applyUiParamChange(midiParam, value);
		});
	};

	applyUiParamChange = (midiParam: MidiParameter, value: number) => {
		//todo: direct access to HW
		this.virtual.circuit.setMidiParam(0, midiParam, value);
	};

	setControllerAnchor = (coord: IPoint2) => {
		this.controllerAnchor = coord;
		this.broker.pub(`web/ui/controller`, this.controllerAnchor);
	};
}
