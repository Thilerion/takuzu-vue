import { ref } from "vue";

const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

export const useTapVibrate = ({
	pattern = 25,
	delay = null,
	enable = isSupported
}) => {
	const patternRef = ref(pattern);
	const isEnabled = ref(enable);

	const _vibrateFn = () => navigator.vibrate(patternRef.value);

	const vibrate = () => {
		if (!isSupported || !isEnabled.value) return;

		if (delay == null) {
			return _vibrateFn();
		} else {
			window.setTimeout(_vibrateFn, delay);
			return;
		}
	}

	const stop = () => {
		if (isSupported) {
			navigator.vibrate(0);
		}
	}

	return {
		isSupported,

		isEnabled,
		pattern: patternRef,

		vibrate,
		stop,
	}
}