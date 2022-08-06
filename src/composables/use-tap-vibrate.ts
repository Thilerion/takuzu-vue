import { ref, unref, type Ref } from "vue";

const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
type UseTapVibrateOpts = {
	pattern: Ref<number | number[]>;
	delay?: Ref<number> | number;
	enable?: Ref<boolean> | boolean;
};

export const useTapVibrate = (opts: UseTapVibrateOpts) => {
	const {
		pattern,
		delay = ref(0),
		enable: enabled = ref(isSupported)
	} = opts;

	let vibrateTimeout: null | ReturnType<typeof setTimeout> = null;

	const _vibrateFn = () => {
		return navigator.vibrate(pattern.value);
	}
	const vibrate = !isSupported ? () => { } : () => {
		if (!unref(enabled)) return;
		const delayMs = unref(delay);

		if (!delayMs) return _vibrateFn();
		if (vibrateTimeout == null) {
			vibrateTimeout = setTimeout(_vibrateFn, delayMs);
			return;
		}
		// vibrateTimeout is still active
		clearTimeout(vibrateTimeout);
		vibrateTimeout = null;
		const halfDelay = delayMs / 2;
		if (halfDelay < 20) return _vibrateFn();
		else {
			vibrateTimeout = setTimeout(_vibrateFn, halfDelay);
		}
	}
	const cancel = () => {
		navigator?.vibrate(0);
	}

	return {
		isSupported,
		isEnabled: enabled,

		pattern,
		delay,

		vibrate,

		stop: cancel,
		cancel,
	}
}