import { loadSettingsFromStorage } from "@/stores/settings/settings-ls.js";
import { DEFAULT_FALLBACK_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from "./constants.js";

export function isLocaleSupported(locale: string): locale is SupportedLocale {
	return SUPPORTED_LOCALES.includes(locale as any);
}

export function getPersistedLocale(): SupportedLocale | null {
	const settings = loadSettingsFromStorage();
	// TODO: settings.language to settings.locale
	const localeFromSettings = settings.language;
	if (localeFromSettings != null && isLocaleSupported(localeFromSettings)) {
		return localeFromSettings;
	}
	return null;
}

export function guessUserLocale(): SupportedLocale | null {
	const locales = navigator.languages || [navigator.language];
	for (const l of locales) {
		if (isLocaleSupported(l)) {
			return l;
		} else {
			// TODO: also support regions, for instance for number and date formatting
			const { language } = splitLocaleParts(l);
			if (isLocaleSupported(language)) {
				return language;
			}
		}
	}
	return null;
}

export function getInitialLocale() {
	const initialLocale = getPersistedLocale() ?? guessUserLocale() ?? DEFAULT_FALLBACK_LOCALE;
	return initialLocale;
}

function splitLocaleParts(str: string): { language: string, region: string | undefined } {
	const [language, region] = str.split('-'); // handle third part?
	return {
		language,
		region,
	}
}