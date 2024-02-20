import type { PuzzleSymbol } from "@/lib/constants";

export const validVibrationStrengths = [0, 18, 32, 45, 60, 76] as const;
export type ValidVibrationStrength = typeof validVibrationStrengths[number];

export type RulerType = 'coords' | 'remainingCount' | 'currentCount' | '';

export const cellThemeTypeMap = {
	'classic': 'symbols',
	'tictactoe': 'symbols',
	'blue-red': 'coloredTiles'
} as const satisfies Record<CellTheme, CellThemeType>;

export type CellTheme = 'classic' | 'tictactoe' | 'blue-red';
export type CellThemeType = 'symbols' | 'coloredTiles';
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
interface InputSettings {
	toggleMode: PuzzleSymbol
}
interface PuzzleAssistanceSettings {
	// automaticValidation: TODO, with values disabled/ruleViolations/incorrectValues, or some other options to be decided,
	checkButton: CheckButtonOption
}
export interface SettingsState extends GameplayInterfaceSettings, AppInterfaceSettings, VibrationSettings, InputSettings, PuzzleAssistanceSettings { }