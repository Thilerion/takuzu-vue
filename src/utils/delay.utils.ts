export async function awaitTimeout(timeout = 300) {
	return new Promise((resolve) => {
		setTimeout(resolve, timeout);
	})
}
export async function awaitRaf() {
	return new Promise((resolve) => {
		requestAnimationFrame(resolve);
	})
}
export async function awaitImmediate() {
	return awaitTimeout(0);
}