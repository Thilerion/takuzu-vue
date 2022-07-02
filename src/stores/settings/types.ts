export const validVibrationStrengths = [0, 18, 32, 45, 60, 76] as const;
export type ValidVibrationStrength = typeof validVibrationStrengths[number];

export type RulerType = 'coords' | 'remainingCount' | 'currentCount' | '';

export const cellThemeTypeMap = {
	'classic': 'symbols' as const,
	'tictactoe': 'symbols' as const,
	'blue-red': 'coloredTiles' as const
}

export type CellTheme = keyof typeof cellThemeTypeMap;
export type CellThemeType = typeof cellThemeTypeMap[CellTheme];
export type CellThemeTypeMap = typeof cellThemeTypeMap;

export type CheckButtonOption = 'disabled' | 'ruleViolations' | 'incorrectValues';


// store state
interface GameplayInterfaceSettings {
	showLineInfo: RulerType,
	enableWakeLock: boolean,
	showTimer: boolean,
}
interface AppInterfaceSettings {
	cellTheme: CellTheme
}
interface VibrationSettings {
	enableVibration: boolean,
	vibrationStrength: ValidVibrationStrength
}
// TODO: convert type to PuzzleSymbol type
interface InputSettings {
	toggleMode: '1' | '0'
}
interface PuzzleAssistanceSettings {
	// automaticValidation: TODO, with values disabled/ruleViolations/incorrectValues, or some other options to be decided,
	checkButton: CheckButtonOption
}
export interface SettingsState extends GameplayInterfaceSettings, AppInterfaceSettings, VibrationSettings, InputSettings, PuzzleAssistanceSettings { }