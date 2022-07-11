const pregenWorker = new Worker(new URL('./pregen-puzzle.worker.ts', import.meta.url), { type: 'module' });

let isBusy = false;

export function sendPregenWorkerMessage(message: unknown) {
	pregenWorker.postMessage({ message });
}

export function initPregenWorkerReceiver() {
	return new Promise((resolve, reject) => {
		pregenWorker.onmessage = (event: MessageEvent<any>) => {
			const { data } = event;
			if (!isBusy) {
				console.error('Pregen worker finished but not busy?');
			}
			isBusy = false;
			if (!data.success) reject(data);
			else resolve(data);
		}
	})
}

export async function initPregenWorker() {
	try {
		if (isBusy) {
			// throw new Error('Already busy.');
			console.log('Pregen worker is already busy, cannot initiate again.');
			return;
		}
		const receivedDataPromise = initPregenWorkerReceiver();
		sendPregenWorkerMessage({ task: 'pregen' });
		isBusy = true;
		const data: any = await receivedDataPromise;
		if (typeof data.value === 'number' && data.value > 0) {
			console.log('Pregen succesful. Amount generated:', data.value);
		}
	} catch(e) {
		console.warn('Could not init pregen worker');
		console.warn(e);
	}
}