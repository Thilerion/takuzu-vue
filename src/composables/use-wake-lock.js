import { usePuzzleStore } from "@/stores/puzzle";
import { useSettingsStore } from "@/stores/settings.js";
import { useWakeLock, useIdle } from "@vueuse/core";
import { computed, onMounted, onUnmounted, provide, ref, toRef, watch, watchEffect } from "vue";

const IDLE_DURATION = 2 * 60 * 1000; // 2 minutes

export const usePuzzleWakeLock = () => {
	const { isSupported, isActive, request, release } = useWakeLock();
	const { idle, lastActive } = useIdle(IDLE_DURATION);
	const settingsStore = useSettingsStore();
	const puzzleStore = usePuzzleStore();

	const hasActivated = ref(isActive.value);
	watch(isActive, (value) => {
		hasActivated.value = value;
	})

	const shouldEnableWakeLock = computed(() => {
		return settingsStore.enableWakeLock && !puzzleStore.paused;
	})
	const requestWakeLock = () => {
		if (shouldEnableWakeLock.value) {
			console.log('Requesting wake lock.');
			request?.();
		}
	}

	const releaseWakeLock = () => {
		if (!isActive.value || !hasActivated.value) {
			return;
		}
		// needed because release is not instantly shown in "isActive"
		hasActivated.value = false;
		release()
			.catch(() => {});
	}

	watch(idle, (isIdle, previousIdle) => {
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
	onUnmounted(() => {
		releaseWakeLock();
	})

	provide('WAKE_LOCK_STATE', {
		active: isActive,
		supported: ref(isSupported)
	});

	return {
		isSupported,
		isActive,
		request: requestWakeLock,
		release: releaseWakeLock,
		idle
	}
}