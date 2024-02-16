import { useMainStore } from "@/stores/main.js"
import { useSettingsStore } from "@/stores/settings/store.js";
import type { RulerType } from "@/stores/settings/types.js";
import { storeToRefs } from "pinia";
import { readonly } from "vue";
import { computed, ref } from "vue";

export const usePlayPuzzleUiState = () => {
	const mainStore = useMainStore();
	const settingsStore = useSettingsStore();

	const dropdownOpen = ref(false);
	const settingsOpen = ref(false);

	const windowHidden = computed(() => mainStore.context.windowHidden);
	const { showLineInfo, showRulers, showTimer } = storeToRefs(settingsStore);
	
	// Ruler settings
	const rulerType = computed(() => {
		if (!showRulers.value) return null;
		if (showLineInfo.value === 'coords') return 'coords';
		else if (showLineInfo.value === 'remainingCount') return 'count-remaining';
		else if (showLineInfo.value === 'currentCount') return 'count-current';
		else return null;
	})
	const rulerSize = computed(() => {
		if (!showRulers.value) return null;
		if (rulerType.value === 'coords') {
			return 16; // 16px
		} else if (rulerType.value?.startsWith('count')) {
			return 'cellSize';
		} else if (rulerType.value === null) {
			return null;
		} else {
			throw new Error('Unexpected ruler type; cannot determine rulerSize.');
		}
	})

	const onDropdownToggled = (val: boolean) => dropdownOpen.value = val;
	const setSettingsOpen = (val: boolean) => settingsOpen.value = val;

	return {
		windowHidden,
		rulerType,
		rulerSize,
		showTimer,
		onDropdownToggled,
		setSettingsOpen,
		settingsOpen: readonly(settingsOpen),
		dropdownOpen: readonly(dropdownOpen),
	}
}