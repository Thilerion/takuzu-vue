import { createWorkerResult } from "./WorkerResult";

const createMessage = createWorkerResult('analyze-puzzle');

addEventListener('message', event => {
	const receivedMsg = event?.data?.message;
	if (!receivedMsg || receivedMsg?.task === 'test-success') {
		const message = createMessage(
			true,
			'Test message: success'
		);
		setTimeout(()=> {
			postMessage(message);

		}, 1000);
	} else if (receivedMsg?.task === 'test-error') {
		const message = createMessage(
			false,
			'Test message: failure'
		);
		setTimeout(()=> {
			postMessage(message);

		}, 1000);
	} else {
		console.warn('Unexpected else statement reached in analysePuzzleWorker');
		console.error({ receivedMsg });
		postMessage(createMessage(false, "Unexpected else statement reached in analysePuzzleWorker, unexpected received message type/command."));
	}
})