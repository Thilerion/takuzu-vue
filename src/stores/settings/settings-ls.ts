import type { SettingsState } from "./types";

export const SETTINGS_STORAGE_KEY = 'takuzu-settings';

const DEFAULT_SETTINGS: Readonly<SettingsState> = Object.freeze({
	showLineInfo: 'remainingCount',
	enableWakeLock: true,
	showTimer: true,

	cellTheme: 'classic',

	enableVibration: true,
	vibrationStrength: 32,

	toggleMode: '0',

	// TODO automaticValidation: 'incorrectValues',
	checkButton: 'incorrectValues'
})
export type SettingsKey = keyof typeof DEFAULT_SETTINGS;

export const getDefaultSettings = (): SettingsState => {
	return { ...DEFAULT_SETTINGS };
}
const settingsKeys = Object.keys(DEFAULT_SETTINGS) as SettingsKey[];

const removeSettingsFromStorage = () => {
	window?.localStorage?.removeItem?.(SETTINGS_STORAGE_KEY);
}

export const parseSettingsFromStorage = (value: string | null | undefined): Partial<SettingsState> => {
	if (value == null) return {};
	const parsed: unknown = JSON.parse(value);
	if (!parsed || typeof parsed !== 'object') {
		throw new Error('Parsed settings from storage is not an object.');
	}
	if (Array.isArray(parsed)) {
		throw new Error('Parsed settings from storage is an error, must be an object.');
	}
	const result: Partial<SettingsState> = {};
	for (const key of settingsKeys) {
		if (key in parsed) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			result[key] = (parsed as Record<string, any>)[key];
		}
	}
	return result;
}


export const loadSettingsFromStorage = (): Partial<SettingsState> => {
	try {
		const data = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
		const parsed = parseSettingsFromStorage(data);
		return parsed;
	} catch (e) {
		removeSettingsFromStorage();
		return {};
	}
}

export const loadSettings = (): SettingsState => {
	const defaults = getDefaultSettings();
	const fromStorage = loadSettingsFromStorage();

	const validResult: SettingsState = validateChangedSettingValues({
		...defaults,
		...fromStorage
	});
	saveSettings(validResult);
	return validResult;
}

export function saveSettings(data: SettingsState) {
	const json = JSON.stringify(data);
	window.localStorage.setItem(SETTINGS_STORAGE_KEY, json);
}

export const validateChangedSettingValues = (data: Record<SettingsKey, unknown>) => {
	if (data.cellTheme === 'binary') {
		// changed 02-07-2022
		data.cellTheme = 'classic';
	}
	return data as SettingsState;
}