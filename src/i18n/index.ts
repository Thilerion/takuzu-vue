import { createI18n, type I18n } from 'vue-i18n';
import messages from '@intlify/unplugin-vue-i18n/messages';
// See vite.config.ts; js/ts locale files are not includes in the combined message import from above, so import those separately and merge them
import enjs from '@/locales/en.js';
import nljs from '@/locales/nl.js';

export const SUPPORTED_LOCALES = ['en', 'nl'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export const localeSettings: Record<SupportedLocale, string> = {
	en: 'English',
	nl: 'Nederlands'
};

console.log({ messages, enjs, nljs });

export function setupI18n(options: { locale: SupportedLocale } = { locale: 'nl' }) {
	const i18n = createI18n({
		...options,
		legacy: false,
		fallbackLocale: 'en',
		availableLocales: SUPPORTED_LOCALES,
		// TODO: lazy load locale messages
		messages: {
			en: {
				...enjs,
				...(messages as Record<string, any>).en
			},
			nl: {
				...nljs,
				...(messages as Record<string, any>).nl
			}
		},
	})
	setI18nLanguage(i18n, options.locale)
	return i18n;
}

export function setI18nLanguage(i18n: I18n<any, any, any, SupportedLocale, false>, locale: SupportedLocale | string) {
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