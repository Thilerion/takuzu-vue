import { useSettingsStore } from "@/features/settings/store.js";
import { cellThemeTypeMap, type CellTheme, type CellThemeType } from "@/features/settings/types.js"
import { storeToRefs } from "pinia";
import { computed, inject, provide, readonly, type App, type ComputedRef, type InjectionKey, type Ref, type Plugin, type MaybeRef, isRef, ref } from "vue"

export type CellThemeContext = {
	cellTheme: Readonly<Ref<CellTheme>>,
	cellThemeType: Readonly<Ref<CellThemeType>>,
	cellClasses: ComputedRef<string[]>
}

const ThemeSymbol: InjectionKey<CellThemeContext> = Symbol('CellThemeContext');

export const appCellThemeProviderPlugin = {
	install: (app: App) => {
		const settingsStore = useSettingsStore();
		const {
			cellTheme: globalCellTheme,
			cellThemeType: globalCellThemeType
		} = storeToRefs(settingsStore);
		const { classes } = createCellThemeComputedData(globalCellTheme, globalCellThemeType);
		const context: CellThemeContext = {
			cellTheme: readonly(globalCellTheme),
			cellThemeType: readonly(globalCellThemeType),
			cellClasses: classes
		}

		app.provide(ThemeSymbol, context);
	}
} satisfies Plugin;

export const useCellTheme = (): CellThemeContext => {
	const theme = inject(ThemeSymbol)
	if (!theme) {
		throw new Error('useCellTheme() must be used within a component, and a CellThemeProvider must be present.')
	}
	return theme
}

export const useLocalCellTheme = (theme: MaybeRef<CellTheme>) => {
	// Can be used to overwrite certain aspects of the (global, or parent-local) cell theme, but is currently not needed anymore
	// const parentContext = inject(ThemeSymbol, null);

	const cellThemeRef = isRef(theme) ? theme : ref(theme);
	
	const themeType = computed(() => cellThemeTypeMap[cellThemeRef.value]);
	const { classes } = createCellThemeComputedData(cellThemeRef, themeType);
	const context: CellThemeContext = {
		cellTheme: cellThemeRef,
		cellThemeType: themeType,
		cellClasses: classes
	}
	provide(ThemeSymbol, context);
	return context;
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