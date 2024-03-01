export const SUPPORTED_LOCALES = ['en', 'nl'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export const localeSettings: Record<SupportedLocale, string> = {
	en: 'English',
	nl: 'Nederlands'
};
export const DEFAULT_FALLBACK_LOCALE = 'en' satisfies SupportedLocale;