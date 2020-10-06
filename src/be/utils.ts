import { ControlChange, Output, Channel, Note } from 'easymidi';


function compare(a, b) {
  return a === b
    ? 0
    : a < b
      ? -1
      : 1;
}

export const arrayToObject = <T>(items: T[], selector: (item: T) => string): {[key: string]: T}=> {
	const r = {};
	items.forEach((item) => {
		r[selector(item)] = item;
	});
	return r;
}

export const compareBy = selector => (a, b) => compare(selector(a), selector(b));

export const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const range = (count: number) => Array.from(new Array(count)).map((_ , i) => i);

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

export const asciiToString = (charCodes: number[]) => String.fromCharCode.apply(null, charCodes);