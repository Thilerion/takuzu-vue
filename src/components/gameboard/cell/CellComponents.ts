import FastPuzzleCellColored from "./FastPuzzleCellColored.vue";
import FastPuzzleCellSymbol from "./FastPuzzleCellSymbol.vue";
import FastPuzzleCellFallback from "./FastPuzzleCellFallback.vue";
import { CellThemeTypes } from "@/features/settings/options.js";

export const CellComponents = {
	[CellThemeTypes.COLORED_TILES]: FastPuzzleCellColored,
	[CellThemeTypes.SYMBOLS]: FastPuzzleCellSymbol,
	"default": FastPuzzleCellFallback
}