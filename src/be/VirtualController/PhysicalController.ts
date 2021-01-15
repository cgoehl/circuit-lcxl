import { UiModMatrixMode, UiState } from "../../shared/UiDtos";
import { IPoint2, range } from "../../shared/utils";
import { Lcxl } from "../NovationLcxl";
import { CircuitVirtualController } from "./CircuitVirtualController";


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
			switch(index) {
				case 0:
					this.handleReloadButton();
					break;
				case 3:
					this.handleModMatrixButton(isPressed);
					break;
			}
		});
		lcxl.on('knob', knob => {
			const { location: { col, row }, value } = knob;
			virtual.handleControlChange(col, row, value);
		})
		virtual.on('changed', this.handleUiStateChange);
	};

	handleReloadButton = () => {
		this.virtual.refresh();
	}

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
	}

	readonly modMatrixModeColors = {
		open: 'redL',
		awaitingCombo: 'amberH',
		closed: 'greenL',
	};
	
	handleUiStateChange = (state: UiState) => {
		const { controllerPage, modMatrix: { mode } } = state;
		this.lcxl.clearLeds();
		range(4).forEach(i => {
			this.lcxl.setDirectionLed(i, i === controllerPage ? 'redH' : 'off');
		});
		// range(4).forEach(i => {
		// 	this.lcxl.setSideLed(i, (i === 3) ? this.modMatrixModeColors[mode] : 'off');
		// });
		this.lcxl.setSideLed(0, 'greenL');
		this.lcxl.setSideLed(3, this.modMatrixModeColors[mode]);
		this.virtual.getGridLeds().forEach(({index, color}) => {
			this.lcxl.setGridLed(index, color);
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
