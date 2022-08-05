import { ref, unref, type Ref } from "vue";

const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
type UseTapVibrateOpts = {
	pattern: Ref<number | number[]>;
	delay?: Ref<number> | number;
	enable?: Ref<boolean> | boolean;
};
export const useTapVibrate = ({
	pattern = ref(25),
	delay = ref(0),
	enable = ref(isSupported)
}: UseTapVibrateOpts) => {
	const patternRef = ref(pattern);
	const isEnabled = ref(enable);

	const _vibrateFn = () => navigator.vibrate(patternRef.value);

	const vibrate = () => {
		if (!isSupported || !isEnabled.value) return;

		if (delay == null) {
			return _vibrateFn();
		} else {
			window.setTimeout(_vibrateFn, unref(delay));
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