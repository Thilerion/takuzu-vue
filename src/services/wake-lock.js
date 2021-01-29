const isSupported = ('wakeLock' in navigator);

const wakeLockState = {
	ref: null,
	isReleased: false,
}

// TODO: listen for wakeLock release and reacquire, for instance after visibility change
// TODO: set timeout

export async function enableWakeLock() {
	if (!isSupported) return false;

	try {
		wakeLockState.ref = await navigator.wakeLock.request('screen');
		listenForWakeLockRelease();
		return true;
	} catch (err) {
		console.warn('Could not enable wakelock');
		console.warn(err);
		return false;
	}
}
export function disableWakeLock() {
	if (!wakeLockState.ref) return;

	wakeLockState.ref.release()
		.then(() => {
			wakeLockState.ref = null;
		});
}
export function getWakeLockState() {
	return wakeLockState;
}

function listenForWakeLockRelease() {
	wakeLockState.ref.addEventListener('release', () => {
		wakeLockState.isReleased = true;
	})
}