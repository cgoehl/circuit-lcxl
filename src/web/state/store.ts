import { createState } from '@hookstate/core';
import { IVirtualControlSection } from '../../shared/VirtualControl';

export interface IAppState {
	id: string,
	isMqttConnected: boolean,
	rootSection: IVirtualControlSection | null,
};

export const store = createState<IAppState>({
	id: Math.random().toString(),
	isMqttConnected: false,
	rootSection: null,
});