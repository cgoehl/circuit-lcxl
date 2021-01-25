import { UiModMatrix, UiModMatrixSlot, UiView } from "../../shared/UiDtos";
import { range } from "../../shared/utils";
import { LcxlGridColor } from "../NovationLcxl";
import { Action, CircuitVirtualController } from "./CircuitVirtualController";
import { VirtualMode } from "./VirtualMode";


export class SynthMatrixMode extends VirtualMode {

	public readonly bottomActions: Action<LcxlGridColor>[] = [];
	public readonly layout: UiModMatrix;

	constructor (
		controller: CircuitVirtualController,
	) {
		super(controller, 'synthMatrix');
		this.layout = this.buildModMatrix();
	}

	protected getKnobLeds = (): LcxlGridColor[] => {
		return range(32).map(index => {
			if (index === 0) { return 'greenH'; }
			if (index > 3 && index < 8 ) { return 'greenH'; }
			return 'off';
		});
	}

	public handleControlChange = (col: number, row: number, value: number): void => {
		const { state: { activeSynth, modMatrix: { slot } }, circuit, updateState } = this.controller;
		if (row !== 0) { return; }
		if (col === 0) {
			updateState(s => ({ ...this.controller.state, modMatrix: { slot: Math.floor(value / 127 * (this.layout.slots.length - 1)) }}));
		}
		if (col > 3) {
			const s = this.layout.slots[slot];
			if(!s) {
				console.warn('out of range', slot);
				return;
			}
			const { source1Address, source2Address, depthAddress, destinationAddress } = s;
			const address = [ source1Address, source2Address, depthAddress, destinationAddress ][col - 4];
			circuit.setMidiParamRelative(activeSynth, circuit.parametersByAddress[address], value);
		}
	}

	buildModMatrix = (): UiModMatrix => {
		const baseAddress = 124;
		const { controller: { circuit }} = this;
		const slots: UiModMatrixSlot[] = range(20)
			.map(i => ({
				slotNumber: i + 1,
				source1Address: baseAddress + i * 4,
				source2Address: baseAddress + i * 4 + 1,
				depthAddress: baseAddress + i * 4 + 2,
				destinationAddress: baseAddress + i * 4 + 3,
			}));
		return {
			sources: circuit.parametersByName['mod matrix 1 source 1'].valueNames,
			destinations: circuit.parametersByName['mod matrix 1 destination'].valueNames,
			slots,
		}
	}

}