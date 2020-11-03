import { createState, DevTools, State } from '@hookstate/core';
import { MidiParameter } from '../../shared/MidiParameter';
import { UiGrid } from '../../shared/UiParameter';
import { IPoint2 } from '../../shared/utils';

export interface ILcxlState {
	knobs: {[key: string]: number | null}
	buttons: {[key: string]: boolean | null}
};

export interface ICircuitPatchState {
	bytes: number[],
	name: string,
	category: number,
	genre: number,
}

export interface ICircuitState {
	patch0: ICircuitPatchState;
	patch1: ICircuitPatchState;
}

export interface IAppState {
	id: string,
	isMqttConnected: boolean,
	ui: {
		layout?: UiGrid,
		controller?: IPoint2,
	}
	circuit: ICircuitState,
	lcxl: ILcxlState,

};

function buildStore() {
	const store = createState<IAppState>({
		id: Math.random().toString(),
		isMqttConnected: false,
		ui: {},
		circuit: {
			patch0: { bytes: [], name: '', category: 0, genre: 0},
			patch1: { bytes: [], name: '', category: 0, genre: 0},
		},
		lcxl: { 
			knobs: {},
			buttons: {},
		}
	});
	DevTools(store).label('store');
	return store;
}

export const store: State<IAppState> = buildStore();