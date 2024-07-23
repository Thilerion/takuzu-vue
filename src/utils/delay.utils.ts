export function awaitTimeout(
	timeout: number,
): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, timeout);
	})
}
export function awaitRaf(): Promise<number> {
	return new Promise((resolve) => {
		requestAnimationFrame(resolve);
	})
}
export async function awaitImmediate(): Promise<void> {
	return awaitTimeout(0);
}

export function awaitIdle(timeout?: number): Promise<IdleDeadline> {
	return new Promise(resolve => requestIdleCallback(resolve, { timeout }));
}