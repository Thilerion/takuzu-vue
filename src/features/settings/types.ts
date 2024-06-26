import type { SupportedLocale } from "@/i18n/constants.js";
import type { PuzzleSymbol } from "@/lib/constants";
import type { CellTheme } from "../board-cell/cell-themes.js";

export const validVibrationStrengths = [0, 18, 32, 45, 60, 76] as const;
export type ValidVibrationStrength = typeof validVibrationStrengths[number];

export type RulerType = 'coords' | 'remainingCount' | 'currentCount' | '';

export type CheckButtonOption = 'disabled' | 'ruleViolations' | 'incorrectValues';


// store state
interface GameplayInterfaceSettings {
	showLineInfo: RulerType,
	enableWakeLock: boolean,
	showTimer: boolean,
}
interface AppInterfaceSettings {
	cellTheme: CellTheme,
	language: SupportedLocale
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