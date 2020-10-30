import { createState, DevTools, State } from '@hookstate/core';
import { MidiParameter } from '../../shared/MidiParameter';

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
	params: MidiParameter[];
	patch0: ICircuitPatchState;
	patch1: ICircuitPatchState;
}

export interface IAppState {
	id: string,
	isMqttConnected: boolean,
	circuit: ICircuitState,
	lcxl: ILcxlState,
};

function buildStore() {
	const store = createState<IAppState>({
		id: Math.random().toString(),
		isMqttConnected: false,
		circuit: {
			params: [],
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