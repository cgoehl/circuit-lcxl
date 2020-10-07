import { createState, DevTools, State } from '@hookstate/core';
import { IVirtualControlSection } from '../../shared/VirtualControl';

export interface IAppState {
	id: string,
	isMqttConnected: boolean,
	rootSection: IVirtualControlSection | null,
	controls: {[key: string]: object}
};

function buildStore() {
	const store = createState<IAppState>({
		id: Math.random().toString(),
		isMqttConnected: false,
		rootSection: null,
		controls: {},
	});
	DevTools(store).label('store');
	return store;
}

export const store: State<IAppState> = buildStore();