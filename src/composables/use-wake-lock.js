import { useSettingsStore } from "@/stores/settings.js";
import { useWakeLock, useIdle } from "@vueuse/core";
import { onMounted, provide, ref, toRef, watch, watchEffect } from "vue";

const IDLE_DURATION = 2 * 60 * 1000; // 1 minute

export const usePuzzleWakeLock = () => {
	const { isSupported, isActive, request, release } = useWakeLock();
	const { idle, lastActive } = useIdle(IDLE_DURATION);
	const settingsStore = useSettingsStore();
	const shouldEnableWakeLock = toRef(settingsStore, 'enableWakeLock');

	const requestWakeLock = () => {
		if (shouldEnableWakeLock.value) {
			console.log('Requesting wake lock.');
			request();
		}
	}

	const releaseWakeLock = () => {
		console.log('Releasing wake lock.');
		release();
	}

	watch(idle, (isIdle, previousIdle) => {
		console.log({ isIdle, previousIdle });
		if (isIdle) {
			releaseWakeLock();
		} else {
			requestWakeLock();
		}
	})
	watch(shouldEnableWakeLock, (curr, prev) => {
		if (curr) requestWakeLock();
		else if (!curr) releaseWakeLock();
	})

	onMounted(() => {
		requestWakeLock();
	})

	provide('WAKE_LOCK_STATE', {
		active: isActive,
		supported: ref(isSupported)
	});

	return {
		isSupported,
		isActive,
		request: requestWakeLock,
		release: releaseWakeLock
	}
}