const CELL_THEMES = ['classic', 'tictactoe', 'blue-red'] as const;
const CELL_THEME_TYPES = ['symbols', 'coloredTiles'] as const;

export type CellTheme = typeof CELL_THEMES[number];
export type CellThemeType = typeof CELL_THEME_TYPES[number];

export const isCellTheme = (val: unknown): val is CellTheme => {
	return typeof val === 'string' && CELL_THEMES.includes(val as any);
}
export const isCellThemeType = (val: unknown): val is CellThemeType => {
	return typeof val === 'string' && CELL_THEME_TYPES.includes(val as any);
}

export const cellThemeTypeMap = {
	'classic': 'symbols',
	'tictactoe': 'symbols',
	'blue-red': 'coloredTiles'
} as const satisfies Record<CellTheme, CellThemeType>;

export const getCellThemeType = (theme: CellTheme): CellThemeType => {
	if (!isCellTheme(theme)) throw new Error(`Invalid cell theme: ${theme}`);
	return cellThemeTypeMap[theme];
}