import { defineStore, storeToRefs } from "pinia";
import { useMainStore } from "../main.js";
import { useSettingsStore } from "../settings/store.js";
import { computed, reactive, readonly, toRefs } from "vue";

export const usePlayPuzzleUiStateStore = defineStore('puzzleUiState', () => {
	const mainStore = useMainStore();
	const settingsStore = useSettingsStore();

	const overlaysOpen = reactive({
		dropdown: false,
		bookmarkManager: false,
		settings: false
	});
	const windowHidden = computed(() => mainStore.context.windowHidden);

	const setDropdownOpen = (val: boolean) => overlaysOpen.dropdown = val;
	const setSettingsOpen = (val: boolean) => overlaysOpen.settings = val;
	const setBookmarkManagerOpen = (val: boolean) => overlaysOpen.bookmarkManager = val;

	const puzzleUiHasOverlay = computed(() => {
		return overlaysOpen.dropdown || overlaysOpen.bookmarkManager || overlaysOpen.settings;
	})
	const puzzleUiActive = computed(() => {
		return !windowHidden.value && !puzzleUiHasOverlay.value;
	})

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

	const {
		dropdown: dropdownOpen,
		bookmarkManager: bookmarkManagerOpen,
		settings: settingsOpen
	} = toRefs(overlaysOpen);
	return {
		// overlay state/ui active state and setters
		dropdownOpen: readonly(dropdownOpen),
		setDropdownOpen,

		bookmarkManagerOpen: readonly(bookmarkManagerOpen),
		setBookmarkManagerOpen,

		settingsOpen: readonly(settingsOpen),
		setSettingsOpen,

		windowHidden,
		puzzleUiHasOverlay,
		puzzleUiActive,

		// ruler settings
		showRulers,
		rulerComponentType,
		rulerCountType,
		rulerSize,

		// misc ui state
		showTimer
	}
})