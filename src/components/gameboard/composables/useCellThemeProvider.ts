import { CellThemeTypes } from "@/stores/settings/options.js";
import { useSettingsStore } from "@/stores/settings/store.js";
import { cellThemeTypeMap, type CellTheme, type CellThemeType } from "@/stores/settings/types.js";
import { storeToRefs } from "pinia";
import type { ComputedRef, InjectionKey } from "vue";
import type { MaybeRef } from "vue";
import type { Ref } from "vue";
import { readonly } from "vue";
import { watchEffect } from "vue";
import { shallowRef } from "vue";
import { unref } from "vue";
import { inject, provide } from "vue";
import { computed, defineAsyncComponent } from "vue";

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

function createCellThemeComputedData(theme: Ref<CellTheme>, type: Ref<CellThemeType>) {
	const cellComponent = computed(() => {
		switch (type.value) {
			case CellThemeTypes.COLORED_TILES:
				return ColoredPuzzleCellComp;
			case CellThemeTypes.SYMBOLS:
				return SymbolPuzzleCellComp;
			default: {
				console.error(`Cell theme type "${type.value}" does not have a matching cell component.`);
				return FallbackPuzzleCellComp;
			}
		}
	})
	const classes = computed(() => {
		return [
			`cell-theme-${theme.value}`,
			`cell-theme-type-${type.value}`
		]
	});

	return { cellComponent, classes };
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

	const { classes, cellComponent: computedCellComponent } = createCellThemeComputedData(globalCellTheme, globalCellThemeType);
	const cellComponent = shallowRef(computedCellComponent.value);
	watchEffect(() => {
		cellComponent.value = computedCellComponent.value;
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
		return initGlobalCellThemeProvider();
	}
	return { ...data };
}

// Merges the injected data with a locally set theme, provides it for its children, and returns it.
export const useLocalCellThemeProvider = (conf: LocalCellThemeConfig): CellThemeProviderData => {
	const injectedData = injectCellThemeData();

	const localTheme = computed(() => unref(conf.theme));
	const localType = computed(() => cellThemeTypeMap[localTheme.value]);
	const localData = {
		...injectedData,
		theme: localTheme,
		type: localType,
		...createCellThemeComputedData(localTheme, localType)
	};

	provide(key, localData);
	return { ...localData };
}