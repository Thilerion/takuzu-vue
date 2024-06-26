import { CellThemeTypes } from "@/features/settings/options.js";
import { useSettingsStore } from "@/features/settings/store.js";
import { cellThemeTypeMap, type CellTheme, type CellThemeType } from "@/features/settings/types.js";
import { storeToRefs } from "pinia";
import type { ComputedRef, InjectionKey, MaybeRef, Ref } from "vue";
import { computed, defineAsyncComponent, inject, markRaw, provide, readonly, unref } from "vue";

const loadCellComponent = async (themeType: CellThemeType | 'default') => {
	const module = await import("../cell/CellComponents.js");
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

type InternalCellThemeProviderData = {
	theme: Ref<CellTheme>;
	type: Ref<CellThemeType>;
	cellComponent: Readonly<Ref<typeof ColoredPuzzleCellComp | typeof SymbolPuzzleCellComp | typeof FallbackPuzzleCellComp>>;
	classes: ComputedRef<string[]>;
}
export type CellThemeProviderData = Omit<InternalCellThemeProviderData, 'theme' | 'type'> & {
	theme: Readonly<Ref<CellTheme>>,
	type: Readonly<Ref<CellThemeType>>
}
export type LocalCellThemeConfig = {
	theme: MaybeRef<CellTheme>
}

const key = Symbol() as InjectionKey<InternalCellThemeProviderData>;
const isInjectedKey = Symbol() as InjectionKey<boolean>;

function createCellThemeComputedData(theme: Ref<CellTheme>, type: Ref<CellThemeType>) {
	const classes = computed(() => {
		return [
			`cell-theme-${theme.value}`,
			`cell-theme-type-${type.value}`
		]
	});

	return { classes };
}

export const initGlobalCellThemeProvider = (): CellThemeProviderData => {
	// check if already initialized. If so, should just call injectCellThemeData
	const isInjected = inject(isInjectedKey, false);
	if (isInjected) {
		throw new Error('Global cell theme provider already initialized. Use injectCellThemeData instead.');
	}

	const settingsStore = useSettingsStore();
	const {
		cellTheme: globalCellTheme,
		cellThemeType: globalCellThemeType
	} = storeToRefs(settingsStore);

	const { classes } = createCellThemeComputedData(globalCellTheme, globalCellThemeType);
	const cellComponent = computed(() => {
		switch (globalCellThemeType.value) {
			case CellThemeTypes.COLORED_TILES:
				return markRaw(ColoredPuzzleCellComp);
			case CellThemeTypes.SYMBOLS:
				return markRaw(SymbolPuzzleCellComp);
			default: {
				return markRaw(FallbackPuzzleCellComp);
			}
		}
	})

	const data = {
		theme: readonly(globalCellTheme),
		type: readonly(globalCellThemeType),
		classes,
		cellComponent: readonly(cellComponent)
	};
	provide(key, data);
	provide(isInjectedKey, true);

	return { ...data };
}

// Simply returns the injected data, or initializes global data if none is found.
export const injectCellThemeData = (): CellThemeProviderData => {
	const data = inject(key);
	if (!data) {
		console.error('No global cell theme provider found. Initializing one now. However, this should never happen.');
		return initGlobalCellThemeProvider();
	}
	return { ...data };
}

// Merges the injected data with a locally set theme, provides it for its children, and returns it.
export const useLocalCellThemeProvider = (conf: LocalCellThemeConfig): CellThemeProviderData => {
	const injectedData = injectCellThemeData();
	const localTheme = computed(() => unref(conf.theme));
	const localType = computed(() => cellThemeTypeMap[localTheme.value]);
	const { classes } = createCellThemeComputedData(localTheme, localType);
	const cellComponent = computed(() => {
		switch (localType.value) {
			case CellThemeTypes.COLORED_TILES:
				return markRaw(ColoredPuzzleCellComp);
			case CellThemeTypes.SYMBOLS:
				return markRaw(SymbolPuzzleCellComp);
			default: {
				return markRaw(FallbackPuzzleCellComp);
			}
		}
	})
	
	const localData = {
		...injectedData,
		theme: localTheme,
		type: localType,
		classes,
		cellComponent: readonly(cellComponent)
	};

	provide(key, localData);
	return { ...localData };
}