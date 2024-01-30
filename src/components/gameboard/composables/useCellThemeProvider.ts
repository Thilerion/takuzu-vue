import { useSettingsStore } from "@/stores/settings/store"
import { CellThemeTypes } from "@/stores/settings/options";
import { cellThemeTypeMap, type CellTheme, type CellThemeType } from "@/stores/settings/types";
import { storeToRefs } from "pinia";
import { computed, inject, provide, unref } from "vue";
import type { Ref } from "vue";
import { defineAsyncComponent } from "vue";

const ColoredPuzzleCellComp = defineAsyncComponent(() => import('../cell/FastPuzzleCellColored.vue'));
const SymbolPuzzleCellComp = defineAsyncComponent(() => import('../cell/FastPuzzleCellSymbol.vue'));
const FallbackPuzzleCellComp = defineAsyncComponent(() => import('../cell/FastPuzzleCellFallback.vue'));

export type UseCellThemeThemeValue = {
	theme: CellTheme,
	type: CellThemeType
}
export type UseCellThemeConfig = { 
	themeValue?: Ref<UseCellThemeThemeValue> | UseCellThemeThemeValue,
	useGlobalTheme?: boolean 
};
export const useCellThemeProvider = ({
	themeValue, // maybeRef
	useGlobalTheme = false
}: UseCellThemeConfig = {}) => {
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

	// TODO: test this computed, may not be correct. Specifically, test themeValue from props/options
	const cellTheme = computed((): CellTheme => {
		if (shouldUseLocalThemeValue.value) {
			const val = unref(themeValue);
			if (val != null) return val.theme;
		}
		return injectedCellThemeData.theme.value;
	})
	const cellThemeType = computed(() => {
		return cellThemeTypeMap[cellTheme.value];
	})

	const cellComponent = computed(() => {
		switch (cellThemeType.value) {
			case CellThemeTypes.COLORED_TILES:
				return ColoredPuzzleCellComp;
			case CellThemeTypes.SYMBOLS:
				return SymbolPuzzleCellComp;
			default: {
				console.error(`Cell theme type "${cellThemeType.value}" does not have a matching cell component.`);
				return FallbackPuzzleCellComp;
			}
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