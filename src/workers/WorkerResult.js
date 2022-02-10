function WorkerError(errorDescription, source) {
	return { success: false, error: errorDescription, source };
}

function WorkerSuccess(value, source) {
	return { success: true, value, source };
}

export const createWorkerResult = (source) => (success, value) => {
	if (success) return WorkerSuccess(value, source);
	else return WorkerError(value, source);
}