import FastPuzzleCellColored from "./FastPuzzleCellColored.vue";
import FastPuzzleCellSymbol from "./FastPuzzleCellSymbol.vue";
import FastPuzzleCellFallback from "./FastPuzzleCellFallback.vue";
import type { Component } from "vue";
import type { CellThemeType } from "../cell-themes.js";

export const CellComponents = {
	'coloredTiles': FastPuzzleCellColored,
	'symbols': FastPuzzleCellSymbol,
	"default": FastPuzzleCellFallback
} satisfies Record<CellThemeType | 'default', Component>;