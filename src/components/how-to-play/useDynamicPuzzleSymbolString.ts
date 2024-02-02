import { ZERO, type PuzzleSymbol } from "@/lib/constants.js";
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
	let display = computed(() => {
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

	const $p = (symbol: PuzzleSymbol, multiple = false) => {
		return display.value(symbol, multiple);
	}
	return { $p };
}