export const rafPromise = () => new Promise((resolve) => {
	requestAnimationFrame(resolve);
})
export const timeoutPromise = (timeout = 250) => new Promise((resolve) => {
	window.setTimeout(resolve, timeout);
})