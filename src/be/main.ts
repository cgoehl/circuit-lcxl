
import { Lcxl } from './NovationLcxl/NovationLcxl';
import { startBroker } from './Broker';
import { Channel, getInputs, getOutputs, Input, Note, Output } from 'easymidi';
import { NovationCircuit } from './NovationCircuit/NovationCircuit';
import { CircuitVirtualController } from './VirtualController/CircuitVirtualController';
import { PhysicalVirtualAdapter } from "./VirtualController/PhysicalController";
import { delay } from '../shared/utils';

let timer: NodeJS.Timeout;
async function generateCpp() {
	timer = setTimeout(() => {}, 999999);
	const code = await NovationCircuit.generateCpp();
	console.log(code);
	clearTimeout(timer);
}

mplx();

// mplx();
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
	const controller = new CircuitVirtualController(circuit, broker);
	await controller.start();
	const l = new PhysicalVirtualAdapter(lcxl, controller);
	await l.start();
}

// async function lxclLedRange() {
// 	console.log('inputs', getInputs());
// 	console.log('outputs', getOutputs());

// 	const broker = await startBroker();
// 	await broker.sub('phy/#', (payload, topic) => {
// 		console.debug(topic, payload);
// 	});
	
// 	const lcxl = await Lcxl.detect();
// 	lcxl.clearLeds();
// 	await broker.sub(`${lcxl.topicPrefix}/event/knob/grid/#`, (payload) => {
// 		const { location : { index }, value } = payload as Knob;
// 		broker.pub(`${lcxl.topicPrefix}/command/led/grid/byIdx/${index}`, { color: value });
// 	});
// 	console.log(lcxl);
// }

async function funnyLightsGame() {
	console.log('inputs', getInputs());
	console.log('outputs', getOutputs());

	// const broker = await startBroker();
	// const lcxl = Lcxl.detect();
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
				// output.send('cc', { channel, controller: lastCC, value: lastValue });
				output.send('noteon', { channel, note: lastNote, velocity: lastValue });
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
		if (i % 2 === 0) {
			output.send('noteon', note);
		} else {
			output.send('noteoff', note);
		}
		await delay(interval);
	}
}

async function genCpp() {
	
}