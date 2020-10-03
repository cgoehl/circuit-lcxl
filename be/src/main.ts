
import { Lcxl } from './NovationLaunchControl';
import { startBroker } from './Broker';
import { Knob } from './PhysicalControl';
import { getInputs, getOutputs, Input, Output } from 'easymidi';

async function main() {
	console.log('inputs', getInputs());
	console.log('outputs', getOutputs());

	const broker = await startBroker();
	await broker.sub('phy/#', (payload, topic) => {
		console.debug(topic, payload);
	});
	
	const lcxl = Lcxl.detect();
	await lcxl.init();
	lcxl.clearLeds();
	await broker.sub(`${lcxl.topicPrefix}/event/knob/grid/#`, (payload) => {
		const { location : { index }, value } = payload as Knob;
		broker.pub(`${lcxl.topicPrefix}/command/led/grid/byIdx/${index}`, { color: value });
	});
	console.log(lcxl);
}

main();
// funnyLightsGame();

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