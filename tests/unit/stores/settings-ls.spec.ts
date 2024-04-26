import { parseSettingsFromStorage, loadSettingsFromStorage, SETTINGS_STORAGE_KEY, loadSettings, getDefaultSettings } from "@/stores/settings/settings-ls";
import type { SettingsState } from "@/stores/settings/types";
import { beforeEach, describe, expect, test } from "vitest";

describe('settings localStorage module', () => {
	describe('parseSettingsFromStorage()', () => {
		test('returns empty object if null or undefined value', () => {
			expect(parseSettingsFromStorage(null)).toEqual({});
			expect(parseSettingsFromStorage(undefined)).toEqual({});
		})
		test('throws error if parsed value is not an object', () => {
			expect(() => parseSettingsFromStorage(JSON.stringify([]))).toThrowError('Parsed settings');
			expect(() => parseSettingsFromStorage(JSON.stringify(null))).toThrowError('Parsed settings');

		})
		test('throws error if JSON can not be parsed', () => {
			const str = '$#%^^GHGFHTF';
			expect(() => parseSettingsFromStorage(str)).toThrowError();
			expect(() => JSON.parse(str)).toThrowError();
		})
		test('returns object from localStorage', () => {
			const settingsObj: Partial<SettingsState> = {
				'showTimer': true
			};
			const json = JSON.stringify(settingsObj);
			expect(parseSettingsFromStorage(json)).toEqual(settingsObj);
		})
		test('does not include keys not valid for settings state', () => {
			const settingsObj: Partial<SettingsState> = {
				'showTimer': true
			};
			const withInvalidKeys = { ...settingsObj, 'something': 1, somethingElse: undefined };
			const json = JSON.stringify(withInvalidKeys);
			expect(parseSettingsFromStorage(json)).toEqual(settingsObj);
		})
	})

	describe('loadSettingsFromStorage()', () => {
		beforeEach(() => {
			window.localStorage.clear();
		})
		test('loading settings from storage without anything in it returns an empty object', () => {
			expect(loadSettingsFromStorage()).toEqual({});
		})
		test('loading invalid settings from storage will trigger removing it from storage', () => {
			window.localStorage.setItem(SETTINGS_STORAGE_KEY, '%^$^#FGDF');
			expect(loadSettingsFromStorage()).toEqual({});
			// was removed
			expect(window.localStorage.getItem(SETTINGS_STORAGE_KEY)).toBe(null);
		})
	})

	describe('loadSettings()', () => {
		beforeEach(() => window.localStorage.clear());

		test('returns default settings if nothing in localStorage', () => {
			expect(loadSettings()).toEqual(getDefaultSettings());
		})

		test('merges default settings with settings in localStorage', () => {
			const lsSettings: Partial<SettingsState> = {
				showTimer: false,
				enableWakeLock: false,
				vibrationStrength: 76,
				enableVibration: false
			}
			
			window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(lsSettings));
			const loaded = loadSettings();
			const defaults = getDefaultSettings();

			expect(defaults.showTimer).not.toBe(lsSettings.showTimer);
			expect(defaults.enableWakeLock).not.toBe(lsSettings.enableWakeLock);
			expect(defaults.vibrationStrength).not.toBe(lsSettings.vibrationStrength);
			expect(defaults.enableVibration).not.toBe(lsSettings.enableVibration);

			expect(loaded).toMatchObject(lsSettings);
			expect(loaded).toMatchInlineSnapshot(`
				{
				  "cellTheme": "classic",
				  "checkButton": "incorrectValues",
				  "enableVibration": false,
				  "enableWakeLock": false,
				  "language": "en",
				  "showLineInfo": "remainingCount",
				  "showTimer": false,
				  "toggleMode": "0",
				  "vibrationStrength": 76,
				}
			`);
		})

		test('does not include additional properties in storage', () => {
			const lsSettings = {
				showTimer: false,
				additional: 1234
			}
			window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(lsSettings));
			const loaded = loadSettings();
			expect(loaded).not.toHaveProperty('additional');
		})

		test('changes cellTheme binary value to cellTheme classic', () => {
			const lsSettings = {
				cellTheme: 'binary'
			};
			window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(lsSettings));
			const loaded = loadSettings();
			expect(loaded.cellTheme).toBe('classic');
		})

		test('automatically updates result in localStorage', () => {
			const lsSettings = {
				cellTheme: 'binary',
				showTimer: false,
				additional: 1234
			};
			window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(lsSettings));
			const loaded = loadSettings();
			const inStorage = JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY) ?? '');
			expect(inStorage.cellTheme).toBe('classic');
			expect(inStorage.showTimer).toBe(false);
			expect(inStorage).not.toHaveProperty('additional');
			expect(loaded).toEqual(inStorage);
		})
	})
})