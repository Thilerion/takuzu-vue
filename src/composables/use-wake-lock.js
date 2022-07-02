import { PUZZLE_STATUS, usePuzzleStore } from "@/stores/puzzle";
import { useSettingsStore } from '@/stores/settings/store';
import { useWakeLock, useIdle } from "@vueuse/core";
import { computed, onMounted, onUnmounted, provide, ref, toRef, watch, watchEffect } from "vue";

const MINUTE = 60 * 1000;

export const usePuzzleWakeLock = ({ pauseAfter = 1.5 * MINUTE } = {}) => {
	const { isSupported, isActive, request, release } = useWakeLock();
	const { idle, lastActive } = useIdle(Math.round(pauseAfter));
	// console.log(`Idle watcher initialized; user is idle after ${(pauseAfter / MINUTE).toFixed(1)} minutes.`);
	const settingsStore = useSettingsStore();
	const puzzleStore = usePuzzleStore();
	const playStatus = toRef(puzzleStore, 'status');

	const hasActivated = ref(isActive.value);
	watch(isActive, (value) => {
		hasActivated.value = value;
	})

	const shouldEnableWakeLock = computed(() => {
		return settingsStore.enableWakeLock && playStatus.value === PUZZLE_STATUS.PLAYING;
	})
	const requestWakeLock = () => {
		if (shouldEnableWakeLock.value) {
			// console.log('Requesting wake lock.');
			request?.();
		}
	}

	const releaseWakeLock = () => {
		// console.log('Releasing wake lock.');
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