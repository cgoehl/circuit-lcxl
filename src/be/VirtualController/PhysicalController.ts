import { UiModMatrixMode, UiState } from "../../shared/UiDtos";
import { IPoint2, range } from "../../shared/utils";
import { Lcxl } from "../NovationLcxl";
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
			if (index === 3) { 
				this.handleModMatrixButton(isPressed);
			}
		});
		lcxl.on('knob', knob => {
			const { location: { col, row }, value } = knob;
			virtual.handleControlChange(col, row, value);
		})
		virtual.on('changed', this.handleUiStateChange);
	};

	handleModMatrixButton = (isPressed: boolean) => {
		const { virtual, lcxl } = this;
		virtual.updateState((state: UiState) => {
			const { modMatrix: { mode, slot }} = state;
			let newMode: UiModMatrixMode = 
				(mode === 'closed' && isPressed) ? 'awaitingCombo' :
				(mode === 'awaitingCombo' && !isPressed) ? 'open' :
				(mode === 'open' && isPressed) ? 'closed' : mode;
			if (newMode === mode) { return state; }
			console.log(newMode);
			return {
				...state,
				modMatrix: { mode: newMode, slot },
		}});
		const { state: { modMatrix: { mode }}} = virtual;
		lcxl.clearLeds();
		if (mode === 'awaitingCombo') {
			virtual.getLedHighlights().forEach(i => {
				lcxl.setGridLed(i, 'amberH');
			})
		} else if (mode === 'open') {
			range(4).forEach(i => lcxl.setGridLed(i + 4, 'greenH'));
			lcxl.setGridLed(0, 'greenH');
		}
	}

	readonly modMatrixModeColors = {
		open: 'amberH',
		awaitingCombo: 'green',
		closed: 'off',
	};
	
	handleUiStateChange = (state: UiState) => {
		const { controllerPage, modMatrix: { mode } } = state;
		range(4).forEach(i => {
			this.lcxl.setDirectionLed(i, i === controllerPage ? 'redH' : 'off');
		});
		range(4).forEach(i => {
			this.lcxl.setSideLed(i, (i === 3) ? this.modMatrixModeColors[mode] : 'off');
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
