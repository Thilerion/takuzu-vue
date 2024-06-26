import type { CellThemeType } from "@/features/settings/types.js";
import { computed, defineAsyncComponent, markRaw, type Ref } from "vue";
import { useCellTheme } from "./cell-theme-provider.js";

const loadCellComponent = async (themeType: CellThemeType | 'default') => {
	const module = await import("../components/CellComponents.js");
	return module.CellComponents[themeType];
}
const ColoredPuzzleCellComp = defineAsyncComponent(async () => {
	return loadCellComponent('coloredTiles');
});
const SymbolPuzzleCellComp = defineAsyncComponent(async () => {
	return loadCellComponent('symbols');
});
const FallbackPuzzleCellComp = defineAsyncComponent(async () => {
	return loadCellComponent('default');
});

export const useCurrentCellComponent = (themeType?: Ref<CellThemeType | 'default'>) => {
	const { cellThemeType: injectedThemeType } = useCellTheme();
	const availableThemeType = computed(() => {
		if (themeType != null) return themeType.value;
		return injectedThemeType.value;
	})
	const cellComponent = computed(() => {
		switch (availableThemeType.value) {
			case 'coloredTiles':
				return markRaw(ColoredPuzzleCellComp);
			case 'symbols':
				return markRaw(SymbolPuzzleCellComp);
			default: {
				return markRaw(FallbackPuzzleCellComp);
			}
		}
	})
	return cellComponent;
}