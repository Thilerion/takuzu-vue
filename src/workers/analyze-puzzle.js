let currentWorker = null;
const hasWorker = () => currentWorker != null;

function initWorker() {
	if (hasWorker()) {
		console.error('Cannot init analyze-puzzle worker; it is already created.');
		return;
	}
	const worker = new Worker(
		new URL('./analyze-puzzle.worker.js', import.meta.url),
		{ type: 'module' }
	);
	console.log({ worker});
	currentWorker = worker;
	initReceiver();
}
function destroyWorker() {
	if (!hasWorker()) {
		console.error('Cannot destroy analyze-puzzle worker; it does not exist.');
		return;
	}
	try {
		currentWorker.terminate();
	} catch(e) {
		console.warn(e);
		console.warn('Error while terminate analyze-puzzle worker');
	} finally {
		currentWorker = null;
	}
}
function send(message) {
	return new Promise((resolve, reject) => {
		initReceiver().then(result => {
			resolve(result);
		}).catch(err => reject(err));
		currentWorker.postMessage({ message });
	})
}
function initReceiver() {
	return new Promise((resolve, reject) => {
		currentWorker.onmessage = event => {
			const { data } = event;
			console.log('Data from analyze-puzzle worker:');
			console.log({ data });
			if (!data.success) reject(data);
			else resolve(data);
		}
	})
}

export { initWorker, destroyWorker, send };