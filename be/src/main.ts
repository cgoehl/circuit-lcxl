
import { readControls } from './midi-def';
import { delay, playNotes } from './utils';
import { NovationCircuit } from './NovationCircuit';
import { NovationLaunchControl } from './NovationLaunchControl';
import { startBroker } from './Broker';

async function main() {
	const broker = await startBroker();
	await broker.sub('+/#', (payload) => console.log(payload));
	await broker.pub('test', 'test');
	await broker.pub('rest', 'rest');
	
	// bus.subscribe(e => console.log('###b', `${e.type}: ${JSON.stringify(e.payload)}`));
	const lcxl = NovationLaunchControl.detect();
}

main();

async function funnyLightsGame() {
	const lcxl = NovationLaunchControl.detect();
	let lastValue = 0;
	let lastCC = 0;
	let lastNote = 0;
	lcxl.input.on('cc', evt => {
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
				lcxl.output.send('cc', cc);
				break;
			case 79:
				lastNote = value;
				const noteOn = { channel, note: lastNote, velocity: lastValue };
				console.log('noteon', noteOn);
				lcxl.output.send('noteon', noteOn);
				break;
		}
	});
}