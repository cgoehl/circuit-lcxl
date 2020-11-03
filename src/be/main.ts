
import { Lcxl } from './NovationLcxl/NovationLcxl';
import { startBroker } from './Broker';
import { Knob } from './PhysicalControl';
import { Channel, getInputs, getOutputs, Input, Note, Output } from 'easymidi';
import { NovationCircuit } from './NovationCircuit/NovationCircuit';
import { CircuitVirtualController } from './NovationCircuit/CircuitVirtualController';
import { delay } from '../shared/utils';

mplx();
//  lxclLedRange();
// funnyLightsGame();

async function mplx() {
	console.log('inputs', getInputs());
	console.log('outputs', getOutputs());

	const broker = await startBroker();
	await broker.sub('+/#', (payload, topic) => {
		console.debug(topic, payload);
	});
	
	const lcxl = await Lcxl.detect();
	lcxl.clearLeds();
	const circuit = await NovationCircuit.detect();
	const c = new CircuitVirtualController(
		lcxl,
		circuit,
		broker
	);
	await c.start();
	// await broker.sub(`${lcxl.topicPrefix}/event/knob/grid/#`, (payload) => {
	// 	const { location : { index, row, col }, value } = payload as Knob;
	// 	broker.pub(`${lcxl.topicPrefix}/command/led/grid/byIdx/${index}`, { color: value });
	// 	// const section = Object.values(circuit.sections)[row];
	// 	// if (section) {
	// 	// 	const param = Object.values(section.parameters)[col];
	// 	// 	if (param) {
	// 	// 		console.log(param.name);
	// 	// 		if (param.protocol.type == 'cc') {
	// 	// 			const cc = param.protocol as MidiCc;
	// 	// 			//todo: create function for clamp
	// 	// 			const clamped = Math.max(cc.minValue, Math.min(cc.maxValue, value));
	// 	// 			const msg = {
	// 	// 				controller: cc.msb,
	// 	// 				value: clamped,
	// 	// 				channel: 0 as Channel,
	// 	// 			};
	// 	// 			console.log(param.name, clamped)
	// 	// 			circuit.midi.output.send('cc', msg);
	// 	// 		} else {
	// 	// 			console.log('Unsupported protocol', param.protocol.type);
	// 	// 		}
	// 	// 	}
	// 	// }
	// });
	// await broker.sub(`web/+/hello`, async (payload: any) => {
	// 	const { id } = payload;
	// 	await broker.pub(`web/${id}/layout`, buildVirtualLayout());
	// })
	// console.log(lcxl);
}

async function lxclLedRange() {
	console.log('inputs', getInputs());
	console.log('outputs', getOutputs());

	const broker = await startBroker();
	await broker.sub('phy/#', (payload, topic) => {
		console.debug(topic, payload);
	});
	
	const lcxl = await Lcxl.detect();
	lcxl.clearLeds();
	await broker.sub(`${lcxl.topicPrefix}/event/knob/grid/#`, (payload) => {
		const { location : { index }, value } = payload as Knob;
		broker.pub(`${lcxl.topicPrefix}/command/led/grid/byIdx/${index}`, { color: value });
	});
	console.log(lcxl);
}

async function funnyLightsGame() {
	console.log('inputs', getInputs());
	console.log('outputs', getOutputs());

	const broker = await startBroker();
	const lcxl = Lcxl.detect();
	// const { midi: { input, output }} = lcxl;

	const isLcxl = (name: String) => name.includes('Launch Control XL');
	const input = new Input(getInputs().find(isLcxl));
	const output= new Output(getOutputs().find(isLcxl));
	let lastValue = 0;
	let lastCC = 0;
	let lastNote = 0;
	console.log(input, output)
	input.on('cc', evt => {
		const { value, controller, channel } = evt;
		console.log(evt);
		switch (controller) {
			case 77:
				lastValue = value;
				console.log('lastValue', lastValue);
				break;
			case 78:
				lastCC = value;
				const cc = { channel, controller: lastCC, value: lastValue };
				console.log('cc', cc);
				output.send('cc', cc);
				break;
			case 79:
				lastNote = value;
				const noteOn = { channel, note: lastNote, velocity: lastValue };
				console.log('noteon', noteOn);
				output.send('noteon', noteOn);
				break;
		}
	});
}

export async function playNotes(output: Output, channel: Channel, notes: number[]): Promise<void> {
	const interval = 150;
	for (let i = 0; i <= (notes.length) * 2; i++) {
		const note: Note = { channel, note: notes[Math.floor(i/2)], velocity: 64 };
		if (i % 2 == 0) {
			output.send('noteon', note);
		} else {
			output.send('noteoff', note);
		}
		await delay(interval);
	}
}