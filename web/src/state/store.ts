import { createState } from '@hookstate/core';

export interface IAppState {
	isMqttConnected: boolean,
};

export const store = createState<IAppState>({
	isMqttConnected: false,
});