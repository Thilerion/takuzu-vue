export const validVibrationStrengths = [0, 18, 32, 45, 60, 76];
export const rulerType = {
	NONE: '',
	COORDS: 'coords',
	COUNT_REMAINING: 'remainingCount',
	COUNT_CURRENT: 'currentCount'
};
export const CellThemeTypes = {
	COLORED_TILES: 'colored',
	SYMBOLS: 'symbols'
}
export const CellThemes = {
	CLASSIC: 'binary',
	TICTACTOE: 'tictactoe',
	BLUE_RED: 'blue-red'
}
export const CellThemeTypeMap = {
	[CellThemes.CLASSIC]: CellThemeTypes.SYMBOLS,
	[CellThemes.TICTACTOE]: CellThemeTypes.SYMBOLS,
	[CellThemes.BLUE_RED]: CellThemeTypes.COLORED_TILES,
}
export const CheckButtonOption = {
	DISABLED: 'disabled',
	RULE_VIOLATIONS: 'ruleViolations',
	INCORRECT_VALUES: 'incorrectValues'
};