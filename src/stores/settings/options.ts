import type { CellTheme, CellThemeType, RulerType } from './types';

export { validVibrationStrengths, cellThemeTypeMap as CellThemeTypeMap } from './types';
export const rulerType = {
	NONE: '',
	COORDS: 'coords',
	COUNT_REMAINING: 'remainingCount',
	COUNT_CURRENT: 'currentCount'
} as const satisfies Record<string, RulerType>;

export const CellThemeTypes = {
	COLORED_TILES: 'coloredTiles',
	SYMBOLS: 'symbols'
} as const satisfies Record<string, CellThemeType>;
export const CellThemes = {
	CLASSIC: 'classic',
	TICTACTOE: 'tictactoe',
	BLUE_RED: 'blue-red'
} as const satisfies Record<string, CellTheme>;
export const CheckButtonOption = {
	DISABLED: 'disabled',
	RULE_VIOLATIONS: 'ruleViolations',
	INCORRECT_VALUES: 'incorrectValues'
} as const;