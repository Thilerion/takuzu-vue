import { useSettingsStore, cellThemeTypeMap } from "@/stores/settings"
import { storeToRefs } from "pinia";
import { computed, inject, provide, reactive, unref, watchEffect } from "vue";
import FastPuzzleCellColored from "../gameboard/cell/FastPuzzleCellColored.vue";
import FastPuzzleCellSymbol from "../gameboard/cell/FastPuzzleCellSymbol.vue";

export const useCellThemeProvider = ({
	themeValue, // maybeRef
	useGlobalTheme = false
} = {}) => {
	const settingsStore = useSettingsStore();

	const {
		cellTheme: storeTheme,
		cellThemeType: storeThemeType
	} = storeToRefs(settingsStore);

	const injectedCellThemeData = inject('cellTheme', { theme: storeTheme, type: storeThemeType });

	const shouldUseLocalThemeValue = computed(() => {
		if (useGlobalTheme) return false;
		if (!unref(themeValue)) return false;
		return true;
	})

	const cellTheme = computed(() => {
		if (shouldUseLocalThemeValue.value) {
			return themeValue?.value ?? themeValue;
		}
		return injectedCellThemeData.theme.value;
	})
	const cellThemeType = computed(() => {
		return cellThemeTypeMap[cellTheme.value];
	})

	const cellComponent = computed(() => {
		switch (cellThemeType.value) {
			case 'colored':
				return FastPuzzleCellColored;
			case 'symbols':
				return FastPuzzleCellSymbol;
			default:
				throw new Error(`Cell theme type "${cellThemeType.value}" does not have a matching cell component.`);
		}
	})

	provide('cellTheme', { theme: cellTheme, type: cellThemeType, component: cellComponent });

	const attrs = computed(() => {
		return {
			'data-cell-theme': cellTheme.value,
			'data-cell-theme-type': cellThemeType.value
		}
	})
	const classes = computed(() => {
		return [
			`cell-theme-${cellTheme.value}`,
			`cell-theme-type-${cellThemeType.value}`
		]
	});

	return { cellTheme, cellThemeType, attrs, classes, cellComponent };
}