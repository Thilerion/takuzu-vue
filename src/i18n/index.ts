import { createI18n, type I18n } from 'vue-i18n';
import { messages } from './messages.js';

export const SUPPORTED_LOCALES = ['en', 'nl'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export const localeSettings: Record<SupportedLocale, string> = {
	en: 'English',
	nl: 'Nederlands'
};

export function setupI18n(options: { locale: SupportedLocale } = { locale: 'nl' }) {
	const i18n = createI18n({
		...options,
		legacy: false,
		fallbackLocale: 'en',
		availableLocales: SUPPORTED_LOCALES,
		messages: messages
	})
	setI18nLanguage(i18n, options.locale)
	return i18n;
}

export function setI18nLanguage(i18n: I18n<any, any, any, SupportedLocale, false>, locale: SupportedLocale) {
	i18n.global.locale.value = locale;
	/**
	 * NOTE:
	 * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
	 * The following is an example for axios.
	 *
	 * axios.defaults.headers.common['Accept-Language'] = locale
	 */
	document.querySelector('html')!.setAttribute('lang', locale)
}