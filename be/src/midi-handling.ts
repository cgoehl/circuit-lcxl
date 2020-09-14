
import { readControls } from './midi-def';
import { delay, playNotes } from './utils';
import { NovationCircuit } from './NovationCircuit';

async function main() {

	// readControls('be/docs/Circuit.csv')
	// .then(rows => {
	// 	console.log(rows);
	// })

	const notes = [60,64,62,63,64,64,67,69];
	const c = NovationCircuit.detect();
	if(c) {
		while(true) {
			await playNotes(c.output, c.channels.synth1, notes);
			await delay(1000);
		}
	}
}

main();