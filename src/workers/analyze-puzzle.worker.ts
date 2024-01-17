import { createWorkerResult } from "./WorkerResult";
const MSG_SOURCE = 'analyze-puzzle';

function runTestTask(success: boolean) {
	const messageValue = 'Test message: ' + (success ? 'success' : 'error');
	const message = createWorkerResult(
		success,
		messageValue,
		MSG_SOURCE
	);
	globalThis.setTimeout(()=> {
		postMessage(message);
	}, 1000);
}
function sendUnknownTaskError(receivedMsg: unknown) {
	console.warn('Unexpected else statement reached in analysePuzzleWorker');
	console.warn({ receivedMsg });
	postMessage(createWorkerResult(false, "Unexpected else statement reached in analysePuzzleWorker, unexpected received message type/command.", MSG_SOURCE));
}
function sendCaughtError(event: Event | string) {
	postMessage(createWorkerResult(false, event, MSG_SOURCE));
}

addEventListener('message', event => {
	const receivedMsg = event?.data?.message ?? {};
	const { task, /* id, data */ } = receivedMsg;

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
