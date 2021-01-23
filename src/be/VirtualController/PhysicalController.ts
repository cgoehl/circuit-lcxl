import { UiModMatrixMode, UiState } from "../../shared/UiDtos";
import { IPoint2, range } from "../../shared/utils";
import { Lcxl, LcxlGridColor } from "../NovationLcxl";
import { CircuitVirtualController } from "./CircuitVirtualController";

interface ActionButton {
	label: string,
	index: number,
	color: LcxlGridColor,
	action: () => void;
}

export class PhysicalVirtualAdapter {

	actionButtons: ActionButton[] = []; 

	constructor(
		readonly lcxl: Lcxl,
		readonly virtual: CircuitVirtualController,
	) { 
		this.actionButtons = [
			{ label: 'Refresh', index: 0, color: 'yellow', action: () => this.virtual.refresh() },
			{ label: 'Save', index: 1, color: 'redH', action: () => {} },
		];
	}

	start = async () => {
		const {  lcxl, virtual } = this;
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
					this.virtual.updateState(state => ({...state, activeSynth: 0 }));
					break;
				case 1:
					this.virtual.updateState(state => ({...state, activeSynth: 1 }));
					break;
				case 3:
					this.handleModMatrixButton(isPressed);
					break;
			}
		});
		lcxl.on('gridButton', ({ location: { index }, isPressed }) => {
			if (!isPressed) { return; }
			const action = this.actionButtons.find(a => a.index === index - 8);
			if (!action) { return; }
			action.action();
		});
		lcxl.on('knob', knob => {
			const { location: { col, row }, value } = knob;
			virtual.handleControlChange(col, row, value);
		})
		virtual.on('changed', this.handleUiStateChange);
		this.handleUiStateChange(virtual.state);
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
		const { controllerPage, modMatrix: { mode }, activeSynth } = state;
		this.lcxl.clearLeds();
		range(4).forEach(i => {
			this.lcxl.setDirectionLed(i, i === controllerPage ? 'redH' : 'off');
		});
		this.lcxl.setSideLed(0, activeSynth === 0 ? 'greenL' : 'off');
		this.lcxl.setSideLed(1, activeSynth === 1 ? 'greenL' : 'off');
		this.lcxl.setSideLed(2, 'off');
		this.lcxl.setSideLed(3, this.modMatrixModeColors[mode]);

		this.virtual.getGridLeds().forEach(({index, color}) => {
			this.lcxl.setGridLed(index, color);
		});
		this.actionButtons.forEach(({ index, color }) => {
			this.lcxl.setGridLed(index + 32, color);
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
