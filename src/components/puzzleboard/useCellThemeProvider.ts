import { useSettingsStore } from "@/stores/settings/store"
import { cellThemeTypeMap, type CellTheme, type CellThemeType } from "@/stores/settings/types";
import { storeToRefs } from "pinia";
import { computed, inject, provide, unref, type Ref } from "vue";
import FastPuzzleCellColored from "../gameboard/cell/FastPuzzleCellColored.vue";
import FastPuzzleCellSymbol from "../gameboard/cell/FastPuzzleCellSymbol.vue";

type InputThemeValue = Ref<CellTheme> | CellTheme;

export const useCellThemeProvider = ({
	themeValue, // maybeRef
	useGlobalTheme = false
}: { themeValue?: InputThemeValue, useGlobalTheme?: boolean } = {}) => {
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

	const cellTheme = computed<CellTheme>(() => {
		if (shouldUseLocalThemeValue.value) {
			return unref(themeValue!);
		}
		return injectedCellThemeData.theme.value;
	})
	const cellThemeType = computed<CellThemeType>(() => {
		return cellThemeTypeMap[cellTheme.value];
	})

	const cellComponent = computed(() => {
		switch (cellThemeType.value) {
			case 'coloredTiles':
				return FastPuzzleCellColored;
			case 'symbols':
				return FastPuzzleCellSymbol;
			default:
				const x: never = cellThemeType.value;
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
		] as const;
	});

	return { cellTheme, cellThemeType, attrs, classes, cellComponent };
}