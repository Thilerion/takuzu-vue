import { useMainStore } from "@/stores/main.js"
import { useSettingsStore } from "@/stores/settings/store.js";
import { storeToRefs } from "pinia";
import { readonly } from "vue";
import { computed, ref } from "vue";

export const usePlayPuzzleUiState = () => {
	const mainStore = useMainStore();
	const settingsStore = useSettingsStore();

	const dropdownOpen = ref(false);
	const settingsOpen = ref(false);

	const windowHidden = computed(() => mainStore.context.windowHidden);
	const { showLineInfo, showRulers, rulerComponentType, showTimer } = storeToRefs(settingsStore);
	
	// Ruler settings
	const rulerCountType = computed(() => {
		if (rulerComponentType.value !== 'count') return null;
		if (showLineInfo.value === 'remainingCount') return 'remaining';
		else if (showLineInfo.value === 'currentCount') return 'current';
		else throw new Error('Unexpected ruler type; cannot determine count type.');
	})
	const rulerSize = computed(() => {
		if (!showRulers.value) return null;
		if (rulerComponentType.value === 'coords') {
			return 16; // 16px
		} else if (rulerComponentType.value === 'count') {
			return 'cellSize';
		} else if (rulerComponentType.value === null) {
			return null;
		} else {
			throw new Error('Unexpected ruler type; cannot determine rulerSize.');
		}
	})

	const onDropdownToggled = (val: boolean) => dropdownOpen.value = val;
	const setSettingsOpen = (val: boolean) => settingsOpen.value = val;

	const puzzleUiActive = computed(() => {
		return !windowHidden.value && !settingsOpen.value && !dropdownOpen.value;
	})

	return {
		windowHidden,
		settingsOpen: readonly(settingsOpen),
		dropdownOpen: readonly(dropdownOpen),

		puzzleUiActive,

		showRulers,
		rulerComponentType,
		rulerCountType,
		rulerSize,
		showTimer,
		onDropdownToggled,
		setSettingsOpen,
	}
}