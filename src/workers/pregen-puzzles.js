import PregenWorker from './pregen-puzzles.worker.js?worker';
const pregenWorker = new PregenWorker();

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
		console.log('Pregen succesful. Amount generated:', data.value);
	} catch(e) {
		console.warn('Could not init pregen worker');
		console.warn(e);
	}
}