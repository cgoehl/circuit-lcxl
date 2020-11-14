import { UiGrid, UiModMatrix, UiState } from '../../shared/UiDtos';
import { Action, createStore, Store } from 'redux';

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

export interface ILayoutState {
	matrix: UiModMatrix,
	knobs: UiGrid,
}


export interface IAppState {
	isConnected: boolean,
	isReady: boolean,
	ui: {
		layout: ILayoutState,
		state: UiState,
	}
	circuit: ICircuitState,
};

export const updateAction = (update: (state: IAppState) => void) => ({
	type: 'APPSTATE_UPDATE',
	payload: { update },
});

interface PatchUpdateAction {
	type: 'PATCH_UPDATE',
	payload: { 
		patch: ICircuitPatchState,
		synthNumber: 0 | 1
	},
}

export const patchUpdate = (patch: ICircuitPatchState, synthNumber: 0 | 1) => ({
	type: 'PATCH_UPDATE',
	payload: { patch, synthNumber },
});

function clone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj)) as T;
}


function reducer(state: IAppState = initial as any, action: Action<string>): IAppState {
	switch(action.type) {
		case 'APPSTATE_UPDATE': {
			const newState = clone(state);
			(action as any).payload.update(newState);
			const { isConnected, ui, circuit } = newState;
			newState.isReady = (isConnected && ui.layout.knobs && ui.layout.matrix && ui.state && circuit.patch0.bytes.length > 0) || false;
			return newState;
		}
		case 'PATCH_UPDATE': {
			const { payload: { patch, synthNumber }} = action as PatchUpdateAction;
			if (synthNumber === 0) {
				return {
					...state,
					circuit: {
						...state.circuit,
						patch0: patch,
					}
				};
			}
			if (synthNumber === 1) {
				return {
					...state,
					circuit: {
						...state.circuit,
						patch1: patch,
					}
				};
			}
			throw new Error('not supported');
		}
		default: return state;
	}
}

const initial = {
	isConnected: false,
	isReady: false,
	ui: {
		layout: {},
	},
	circuit: {
		patch0: { bytes: [], name: '', category: 0, genre: 0},
		patch1: { bytes: [], name: '', category: 0, genre: 0},
	},
};

export const store: Store<IAppState> = createStore(
	reducer,
	(window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
	);