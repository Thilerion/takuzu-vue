import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { useSettingsStore } from '@/features/settings/store';
import { useWakeLock, useIdle } from "@vueuse/core";
import { computed, onMounted, onUnmounted, provide, ref, toRef, watch } from "vue";

const MINUTE = 60 * 1000;

export const usePuzzleWakeLock = ({ pauseAfter = 1.5 * MINUTE } = {}) => {
	const { isSupported, isActive, request, release } = useWakeLock();
	const { idle } = useIdle(Math.round(pauseAfter));

	const settingsStore = useSettingsStore();
	const puzzleStore = usePuzzleStore();
	const playStatus = toRef(puzzleStore, 'status');

	const hasActivated = ref(isActive.value);
	watch(isActive, (value) => {
		hasActivated.value = value;
	}, {
		flush: 'sync'
	})

	const shouldEnableWakeLock = computed(() => {
		return settingsStore.enableWakeLock && playStatus.value === 'playing' && !idle.value;
	})
	const requestWakeLock = async () => {
		if (shouldEnableWakeLock.value && !hasActivated.value) {
			try {
				await request?.('screen');
			} catch(e) {
				if (e instanceof Error && e.name === 'NotAllowedError') {
					console.warn('Wake lock request failed: "NotAllowedError".');
				} else throw e;
			}
		}
	}

	const releaseWakeLock = () => {
		if (!isActive.value || !hasActivated.value) {
			return;
		}
		// needed because release is not instantly shown in "isActive"
		hasActivated.value = false;
		release?.()
			.catch(() => {
				console.warn('Could not release wake lock.');
			});
	}

	watch(shouldEnableWakeLock, (curr) => {
		if (curr) requestWakeLock();
		else if (!curr) releaseWakeLock();
	}, { immediate: true });

	onMounted(() => {
		requestWakeLock();
	})
	onUnmounted(() => {
		releaseWakeLock();
	})

	provide('WAKE_LOCK_STATE', {
		active: isActive,
		supported: isSupported
	});

	return {
		isSupported,
		isActive,
		request: requestWakeLock,
		release: releaseWakeLock,
		idle
	}
}