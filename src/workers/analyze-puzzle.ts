let currentWorker: Worker | null = null;
const hasWorker = () => currentWorker != null;

function initWorker() {
	if (hasWorker()) {
		console.error('Cannot init analyze-puzzle worker; it is already created.');
		return;
	}
	console.log('Initializing analysis worker');
	const worker = new Worker(
		new URL('./analyze-puzzle.worker.ts', import.meta.url),
		{ type: 'module' }
	);
	currentWorker = worker;
	initReceiver();
}
function destroyWorker() {
	if (!hasWorker()) {
		console.error('Cannot destroy analyze-puzzle worker; it does not exist.');
		return;
	}
	try {
		currentWorker!.terminate();
	} catch(e) {
		console.warn(e);
		console.warn('Error while terminate analyze-puzzle worker');
	} finally {
		currentWorker = null;
	}
}
function send(message: unknown) {
	return new Promise((resolve, reject) => {
		initReceiver().then(result => {
			resolve(result);
		}).catch(err => reject(err));
		currentWorker!.postMessage({ message });
	})
}
function initReceiver() {
	return new Promise((resolve, reject) => {
		currentWorker!.onmessage = event => {
			const { data } = event;
			console.log('Data from analyze-puzzle worker:');
			console.log({ data });
			if (!data.success) reject(data);
			else resolve(data);
		}
	})
}
function terminate() {
	console.log('Terminating analysis worker');
	try {
		if (!hasWorker()) {
			return true;
		}
		currentWorker!.terminate();
		currentWorker = null;
		return true;
	} catch(e) {
		console.warn(e);
		return false;
	}
}

export { initWorker, destroyWorker, send, terminate };