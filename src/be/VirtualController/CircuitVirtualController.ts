import { EventEmitter } from "tsee";
import { UiView as UiViewKey, UiState } from "../../shared/UiDtos";
import { IPoint2, range } from "../../shared/utils";
import { IBroker } from "../Broker";
import { NovationCircuit } from "../NovationCircuit/NovationCircuit";
import { Lcxl, LcxlGridColor, LcxlSideColor } from "../NovationLcxl";
import { SelectSlotMode } from "./SelectSlotMode";
import { SynthMatrixComboMode } from "./SynthMatrixComboMode";
import { SynthMatrixMode } from "./SynthMatrixMode";
import { SynthParamsMode } from "./SynthParamsMode";
import { VirtualMode } from "./VirtualMode";

export interface Action<TColor> {
	label: string,
	index: number,
	color: () => TColor,
	onPress?: () => void,
	onRelease?: () => void,
}

export class CircuitVirtualController extends EventEmitter<{
	changed: (newValue: UiState) => void,
}>{

	public controllerSize = { x: 8, y: 4 };

	public state : UiState = {
		controllerPage: 0,
		controllerAnchor: { x: 0, y: 0 },
		activeSynth: 0,
		activeView: 'synthParams',
		modMatrix: {
			slot: 0,
		},
		selectSlot: {
			index: 0,
			page: 0,
			pendingAction: () => {}
		},
	};

	public readonly sideActions: Action<LcxlSideColor>[];
	public readonly directionActions: Action<boolean>[];

	private readonly viewKeys: UiViewKey[] = [ 'synthParams', 'synthMatrix' ];
	private readonly views: {[ key: string ]: VirtualMode } = {};

	private activeView = () => this.views[this.state.activeView];

	private readonly synthParamsMode: SynthParamsMode;
	private readonly synthMatrixMode: SynthMatrixMode;
	private readonly synthMatrixComboMode: SynthMatrixComboMode;
	
	constructor(
		readonly circuit: NovationCircuit,
		readonly broker: IBroker,
	) {
		super();

		this.views.synthParams = this.synthParamsMode = new SynthParamsMode(this);
		this.views.synthMatrix = this.synthMatrixMode = new SynthMatrixMode(this);
		this.views.synthMatrixCombo = this.synthMatrixComboMode = new SynthMatrixComboMode(
			this, 
			this.synthParamsMode.layout,
			this.synthMatrixMode.layout);
		this.views.selectSlot = new SelectSlotMode(this);
		
		this.sideActions = this.viewKeys
			.map((view, index) => {
				return {
					label: view,
					index,
					color: () => this.state.activeView === view ? 'high' : 'off', 
					onRelease: () => { this.updateState( state => ({ ...state, activeView: view }))}
				} as Action<LcxlSideColor>;
			});
		this.sideActions[1].onPress = () => { 
			this.updateState( state => ({ ...state, activeView: 'synthMatrixCombo' }))};
	
		this.directionActions = range(4).map(index => ({
			label: `Page ${index}`,
			index,
			color: () => this.state.controllerPage === index,
			onPress: () => {
				this.updateState(state => ({
					...state,
					controllerPage: index,
					controllerAnchor: this.pageToAnchor(index),
				}));
			}
		}));	
	}

	start = async () => {
		const { broker, circuit } = this;
		await broker.sub(`web/hello`, async (payload: any) => {
			broker.pub(`web/ui/layout/knobs`, this.synthParamsMode.layout.buildGrid());
			broker.pub(`web/ui/layout/mod-matrix`, this.synthMatrixMode.layout);
			this.updateState(s => s);
			circuit.announceState();
		});
		circuit.on('patchChanged', (synthNumber, patch) => broker.pub(`web/circuit/patch`, { patch, synthNumber }));
	}

	save = () => {
		const pendingAction = (slot, confirmed) => {
			if (confirmed) {
				const { activeSynth } = this.state;
				const patch = activeSynth === 0 ? this.circuit.patch0 : this.circuit.patch1;
				this.circuit.savePatch(patch.get(), slot);
			}
			this.updateState(state => ({ ...state, activeView: 'synthParams' }));
		}

		this.updateState(state => {
			return {
				...state,
				activeView: 'selectSlot',
				selectSlot: {
					index: 0,
					page: 0,
					pendingAction,
				}
			}
		});
	}

	getBottomActions = () => this.activeView().bottomActions;

	handleControlChange = (col: number, row: number, value: number) => this.activeView().handleControlChange(col, row, value);

	getGridLeds = (): LcxlGridColor[] => this.activeView().getGridLeds();

	getSideLeds = (): LcxlSideColor[] => range(4)
		.map(index => {
			return index >= this.viewKeys.length ? 'off' :
				index === this.viewKeys.indexOf(this.state.activeView) ? 'high' : 'low';
		});

	getDirectionLeds = () => range(4).map(index => index === this.state.controllerPage);


	updateState = (func: (state: UiState) => UiState) => {
		this.state = func(this.state);
		this.emit('changed', this.state);
		this.broker.pub(`web/ui/state`, this.state);
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
