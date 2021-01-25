import { UiModMatrix, UiModMatrixSlot, UiView } from "../../shared/UiDtos";
import { range } from "../../shared/utils";
import { LcxlGridColor } from "../NovationLcxl";
import { Action, CircuitVirtualController } from "./CircuitVirtualController";
import { VirtualMode } from "./VirtualMode";


export class SelectSlotMode extends VirtualMode {

	public readonly bottomActions: Action<LcxlGridColor>[];

	constructor (
		controller: CircuitVirtualController,
	) {
		super(controller, 'selectSlot');
		const callAction = (confirmed: boolean) => {
			const { state: { selectSlot: { index, page, pendingAction }}} = this.controller;
			pendingAction( index + page * 32, confirmed);
		};
		this.bottomActions = [
			{ 
				label: '0 - 31', 
				index: 0, 
				color: () => this.controller.state.selectSlot.page === 0 ? 'greenH' : 'yellow', 
				onPress: () => this.controller.updateState( state => ({ ...state, selectSlot: { ...state.selectSlot, page: 0 }})),
			}, { 
				label: '32 - 63', 
				index: 1, 
				color: () => this.controller.state.selectSlot.page === 1 ? 'greenH' : 'yellow', 
				onPress: () => this.controller.updateState( state => ({ ...state, selectSlot: { ...state.selectSlot, page: 1 }})),
			}, 
			{ label: 'Cancel', index: 6, color: () => 'redL',	onPress: () => callAction(false) },
			{ label: 'Ok', index: 7, color: () => 'greenL',	onPress: () => callAction(true) },
		];
	}

	protected getKnobLeds = (): LcxlGridColor[] => {
		const { state: { selectSlot: { index }}} = this.controller;
		return range(32).map(idx => idx === index ? 'greenH' : 'off');
	}

	public handleControlChange = (col: number, row: number, value: number): void => {
		const { state: { selectSlot }, updateState } = this.controller;
		if ( row === 0 && col === 0 ) {
			const index = Math.floor((value) / 4);
			updateState( state => ({ ...state, selectSlot: { ...selectSlot, index }}))
		}
	}
}