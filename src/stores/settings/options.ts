import type { CellTheme, CellThemeType, RulerType } from './types';

export { validVibrationStrengths, cellThemeTypeMap as CellThemeTypeMap } from './types';
export const rulerType: Record<string, RulerType> = {
	NONE: '',
	COORDS: 'coords',
	COUNT_REMAINING: 'remainingCount',
	COUNT_CURRENT: 'currentCount'
} as const;

export const CellThemeTypes: Record<string, CellThemeType> = {
	COLORED_TILES: 'coloredTiles',
	SYMBOLS: 'symbols'
} as const;
export const CellThemes: Record<string, CellTheme> = {
	CLASSIC: 'classic',
	TICTACTOE: 'tictactoe',
	BLUE_RED: 'blue-red'
} as const;
export const CheckButtonOption = {
	DISABLED: 'disabled',
	RULE_VIOLATIONS: 'ruleViolations',
	INCORRECT_VALUES: 'incorrectValues'
};