import { createWorkerResult } from "./WorkerResult";

const createMessage = createWorkerResult('analyze-puzzle');

function runTestTask(success) {
	const messageValue = 'Test message: ' + (success ? 'success' : 'error');
	const message = createMessage(
		success,
		messageValue
	);
	setTimeout(()=> {
		postMessage(message);
	}, 1000);
}
function sendUnknownTaskError(receivedMsg) {
	console.warn('Unexpected else statement reached in analysePuzzleWorker');
	console.warn({ receivedMsg });
	postMessage(createMessage(false, "Unexpected else statement reached in analysePuzzleWorker, unexpected received message type/command."));
}
function sendCaughtError(event) {
	postMessage(createMessage(false, event));
}

addEventListener('message', event => {
	const receivedMsg = event?.data?.message ?? {};
	const { task, id, data } = receivedMsg;

	switch(task) {
		case 'test-success': {
			runTestTask(true);
			return;
		}
		case 'test-failure': {
			runTestTask(false);
			return;
		}
		case 'test-error': {
			throw new Error('Test error');
		}
		case 'test-unhandledrejection': {
			return new Promise((resolve, reject) => {
				reject('Test unhandled rejection');
			})
		}
		default: {
			sendUnknownTaskError(receivedMsg);
		}
	}
})

self.addEventListener('unhandledrejection', event => {
	event.preventDefault();
	console.warn('Caught an unhandled rejection inside analyzePuzzleWorker');
	console.warn(event);
	sendCaughtError('Caught unhandled rejection inside worker.');
})
self.addEventListener('error', event => {
	event.preventDefault();
	console.warn('Caught an error inside analyzePuzzleWorker');
	console.warn(event);
	sendCaughtError('Caught error inside worker.');
})
