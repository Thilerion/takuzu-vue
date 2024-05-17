import { useTapVibrate } from "@/composables/use-tap-vibrate.js";
import { useSettingsStore } from "@/features/settings/store.js";
import { storeToRefs } from "pinia";
import { computed, type Ref } from "vue";

export const usePuzzleTapVibrate = (rows: Ref<number>, columns: Ref<number>) => {
	const settingsStore = useSettingsStore();
	const { vibrationEnabled: shouldEnableVibration, vibrationStrength: vibrationStrengthSetting } = storeToRefs(settingsStore);
	const numCells = computed(() => rows.value * columns.value);

	const vibrateDelay = computed(() => {
		if (numCells.value > 132) return 15;
		else if (numCells.value > 72) return 5;
		return 0;
	})

	const {
		vibrate
	} = useTapVibrate({
		pattern: vibrationStrengthSetting,
		delay: vibrateDelay,
		enable: shouldEnableVibration
	});

	return {
		vibrate
	}
}