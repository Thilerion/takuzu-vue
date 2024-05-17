import { CellThemeTypes } from "@/features/settings/options.js";
import { useSettingsStore } from "@/features/settings/store.js";
import { cellThemeTypeMap, type CellTheme, type CellThemeType } from "@/features/settings/types.js";
import { storeToRefs } from "pinia";
import type { ComputedRef, InjectionKey, MaybeRef, Ref } from "vue";
import { computed, defineAsyncComponent, inject, markRaw, provide, readonly, shallowRef, unref, watchEffect } from "vue";

const ColoredPuzzleCellComp = defineAsyncComponent(() => import('../cell/FastPuzzleCellColored.vue'));
const SymbolPuzzleCellComp = defineAsyncComponent(() => import('../cell/FastPuzzleCellSymbol.vue'));
const FallbackPuzzleCellComp = defineAsyncComponent(() => import('../cell/FastPuzzleCellFallback.vue'));

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

function getCellComponent(themeType: Ref<CellThemeType>) {
	switch (themeType.value) {
		case CellThemeTypes.COLORED_TILES:
			return markRaw(ColoredPuzzleCellComp);
		case CellThemeTypes.SYMBOLS:
			return markRaw(SymbolPuzzleCellComp);
		default: {
			console.error(`Cell theme type "${themeType.value}" does not have a matching cell component.`);
			return markRaw(FallbackPuzzleCellComp);
		}
	}
}

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
	const cellComponent = shallowRef(getCellComponent(globalCellThemeType));
	watchEffect(() => {
		cellComponent.value = getCellComponent(globalCellThemeType);
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
	const cellComponent = shallowRef(getCellComponent(localType));
	watchEffect(() => {
		cellComponent.value = getCellComponent(localType);
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