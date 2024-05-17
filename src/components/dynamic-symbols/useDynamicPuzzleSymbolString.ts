import { ZERO, type PuzzleSymbol } from "@/lib/constants.js";
import { isPuzzleValue } from "@/lib/utils/puzzle-value.utils";
import type { CellTheme, CellThemeType } from "@/features/settings/types.js";
import type { Ref } from "vue";
import { computed } from "vue";

const getBlueRedString = (val: PuzzleSymbol, multiple?: boolean) => {
	if (val === ZERO) {
		if (multiple) return 'Themed.blue-tiles';
		return 'Themed.blue-tile';
	} else {
		if (multiple) return 'Themed.red-tiles';
		return 'Themed.red-tile';
	}
	// return `${val === ZERO ? 'blue' : 'red'} tile${multiple ? 's' : ''}`;
}
const getClassicString = (val: PuzzleSymbol, multiple?: boolean) => {
	if (val === ZERO) {
		if (multiple) return 'Themed.0s';
		return 'Themed.0';
	} else {
		if (multiple) return 'Themed.1s';
		return 'Themed.1';
	}
}
const getTictactoeString = (val: PuzzleSymbol, multiple?: boolean) => {
	if (val === ZERO) {
		if (multiple) return 'Themed.Os';
		return 'Themed.O';
	} else {
		if (multiple) return 'Themed.Xs';
		return 'Themed.X';
	}
}

export type ToDynamicPuzzleString = (v: PuzzleSymbol | 'symbol', multiple?: boolean) => string;

export const useDynamicPuzzleSymbolString = (theme: Ref<CellTheme>, themeType: Ref<CellThemeType>) => {
	const displaySymbol = computed(() => {
		switch(theme.value) {
			case 'blue-red': return getBlueRedString;
			case 'classic': return getClassicString;
			case 'tictactoe': return getTictactoeString;
			default: {
				const x: never = theme.value;
				console.error(`unexpected cellTheme: ${x}`);
				return getClassicString; // default to classic
			}
		}
	})
	const displayCellType = computed((): (multiple?: boolean) => string => {
		switch(themeType.value) {
			case 'symbols': return (multiple?: boolean) => {
				if (multiple) return 'Themed.symbols';
				return 'Themed.symbol';
			}
			case 'coloredTiles': return (multiple?: boolean) => {
				if (multiple) return 'Themed.colors';
				return 'Themed.color';
			}
			default: {
				const x: never = themeType.value;
				console.error(`unexpected cellThemeType: ${x}`);
				return (multiple?: boolean) => {
					if (multiple) return 'Themed.symbols';
					return 'Themed.symbol';
				}
			}
		}
	})

	const $p: ToDynamicPuzzleString = (symbol: PuzzleSymbol | 'symbol', multiple = false) => {
		if (isPuzzleValue(symbol)) return displaySymbol.value(symbol, multiple);
		else if (symbol === 'symbol') return displayCellType.value(multiple);
		else return symbol;
	}
	return { $p };
}