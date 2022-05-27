import { useStorage } from "@vueuse/core";
import { computed, reactive, ref, watch } from "vue"
import { useDebugMode } from "./useDebugMode";

export const useFeatureToggles = () => {
	const { enabled: debugModeEnabled } = useDebugMode();

	const storageState = useStorage('takuzu_feature-toggles', {}, localStorage, {
		writeDefaults: true,
		deep: true
	});

	const features = reactive({
		addPuzzleToHistoryWithCheats: useFeatureToggle({ 
			defaultValue: storageState.value?.addPuzzleToHistoryWithCheats ?? false,
			requiresDebugMode: true,
			label: 'Add puzzle to history if cheats used'
		}),
		analysisTool: useFeatureToggle({
			defaultValue: storageState.value?.analysisTool ?? debugModeEnabled.value,
			requiresDebugMode: true,
			label: 'Analysis tool'
		}),
		customPuzzleTool: useFeatureToggle({
			defaultValue: storageState.value?.customPuzzleTool ?? debugModeEnabled.value,
			requiresDebugMode: true,
			label: 'Custom puzzle tool'
		}),
	});
	const featureNames = computed(() => {
		return Object.keys({...features});
	})

	const featureValues = computed(() => {
		const keys = featureNames.value;
		const result = {};
		for (const key of keys) {
			result[key] = features[key].toggleValue;
		}
		return result;
	})

	watch(featureValues, (v) => {
		storageState.value = v;
	}, { immediate: true });

	return features;
}

export const useFeatureToggle = ({
	defaultValue, requiresDebugMode, label
}) => {
	const { enabled: debugModeEnabled } = useDebugMode();

	const toggleValue = ref(defaultValue);
	const isEnabled = requiresDebugMode ? computed({
		get: () => debugModeEnabled.value && (toggleValue.value ?? true),
		set: (value) => toggleValue.value = value
	}) : computed({
		get: () => toggleValue.value ?? true,
		set: (value) => toggleValue.value = value
	});
	return { toggleValue, isEnabled, label };
}