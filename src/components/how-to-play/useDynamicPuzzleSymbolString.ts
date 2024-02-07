import { ZERO, type PuzzleSymbol } from "@/lib/constants.js";
import { isValidPuzzleValue } from "@/lib/utils.js";
import type { CellTheme, CellThemeType } from "@/stores/settings/types.js";
import type { Ref } from "vue";
import { computed } from "vue";

const getBlueRedString = (val: PuzzleSymbol, multiple?: boolean) => {
	return `${val === ZERO ? 'blue' : 'red'} tile${multiple ? 's' : ''}`;
}
const getClassicString = (val: PuzzleSymbol, multiple?: boolean) => {
	let str = `${val === ZERO ? "0" : "1"}`;
	if (multiple) str += '\'s';
	return str;
}
const getTictactoeString = (val: PuzzleSymbol, multiple?: boolean) => {
	let str = `${val === ZERO ? "O" : "X"}`;
	if (multiple) str += '\'s';
	return str;
}

export const useDynamicPuzzleSymbolString = (theme: Ref<CellTheme>, themeType: Ref<CellThemeType>) => {
	let displaySymbol = computed(() => {
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
	const displayCellType = computed(() => {
		switch(themeType.value) {
			case 'symbols': return (multiple?: boolean) => {
				if (multiple) return 'symbols';
				return 'symbol';
			}
			case 'coloredTiles': return (multiple?: boolean) => {
				if (multiple) return 'color tiles';
				return 'color';
			}
		}
	})

	const $p = (symbol: PuzzleSymbol | 'symbol', multiple = false) => {
		if (isValidPuzzleValue(symbol)) return displaySymbol.value(symbol, multiple);
		else if (symbol === 'symbol') return displayCellType.value(multiple);
		else return symbol;
	}
	return { $p };
}