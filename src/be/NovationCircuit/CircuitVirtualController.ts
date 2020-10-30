import { UiGrid, UiParameter } from "../../shared/UiParameter";
import { IBroker } from "../Broker";
import { Lcxl } from "../NovationLcxl";
import { NovationCircuit } from "./NovationCircuit";

export class CircuitVirtualContorller {
	constructor(
		readonly lcxl: Lcxl,
		readonly circuit: NovationCircuit,
		readonly broker: IBroker,
	) {}


	start = async () => {
		const { broker, lcxl, circuit } = this;
		lcxl.clearLeds();
		await broker.sub(`web/hello`, async (payload: any) => {

			broker.pub(
				`web/ui`,
				this.buildUi()
			);
			circuit.announceState();
			lcxl.announceState();
		});

		const patchHandler = synthNumber => patch => broker.pub(`web/circuit/patch`, { patch, synthNumber });
		circuit.patch0.on('changed', patchHandler(0));
		circuit.patch1.on('changed', patchHandler(1));
	}

	buildUi = () => {
		const createOscSection = (id: string): UiGrid => {
			const items = [
				`osc ${id} level`,
				`osc ${id} wave`,
				`osc ${id} wave interpolate`,
				`osc ${id} pulse width index`,
				`osc ${id} virtual sync depth`,
				`osc ${id} density`,
				`osc ${id} density detune`,
				`osc ${id} semitones`,
				`osc ${id} cents`,
				`osc ${id} pitchbend`,
			].map((paramName: string): UiParameter => {
				const { sysexAddress, name, protocol: { minValue, maxValue } } = this.circuit.parametersByName[paramName];
				return {
					type: 'parameter',
					label: name.replace(`osc ${id} `, ''),
					minValue,
					maxValue,
					address: sysexAddress,
				};
			});
			return {
				type: 'grid',
				rows: 2,
				columns: 5,
				items,
			}
		}
		return createOscSection('1');
	}
}
