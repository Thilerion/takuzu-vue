const pregenWorker = new Worker(new URL("./pregen-puzzles.worker.js", import.meta.url));

export function sendPregenWorkerMessage(message) {
	pregenWorker.postMessage({ message });
}
export function initPregenWorkerReceiver() {
	return new Promise((resolve, reject) => {
		pregenWorker.onmessage = event => {
			const { data } = event;
			if (data.error) reject(data.error);
			else resolve(data);
		}
	})
}

export async function initPregenWorker() {
	try {
		const receivedDataPromise = initPregenWorkerReceiver();
		sendPregenWorkerMessage({ task: 'pregen' });
		const data = await receivedDataPromise;
		console.log('Pregen succesfull');
		console.log({data});
	} catch(e) {
		console.warn('Could not init pregen worker');
		console.warn(e);
	}
}