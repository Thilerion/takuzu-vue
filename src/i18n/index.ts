import { createI18n } from 'vue-i18n';
import messages from '@intlify/unplugin-vue-i18n/messages';
// See vite.config.ts; js/ts locale files are not includes in the combined message import from above, so import those separately and merge them
import enjs from '@/locales/en.js';
import nljs from '@/locales/nl.js';
import type { PiniaPlugin } from 'pinia';
import { markRaw, watch } from 'vue';
import { DEFAULT_FALLBACK_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from './constants.js';
import { getInitialLocale } from './helpers.js';
import { numberFormats } from './number-formats.js';
import { datetimeFormats } from './datetime-formats.js';

const mergedMessages = {
	en: {
		...enjs,
		...(messages as Record<string, any>).en
	},
	nl: {
		...nljs,
		...(messages as Record<string, any>).nl
	}
};

const i18n = createI18n({
	locale: getInitialLocale(),
	legacy: false,
	fallbackLocale: DEFAULT_FALLBACK_LOCALE,
	availableLocales: SUPPORTED_LOCALES,
	// TODO: lazy load locales
	// TODO: separate some messages by component/route
	messages: mergedMessages,
	numberFormats: numberFormats,
	datetimeFormats: datetimeFormats,
})
export type AppI18n = typeof i18n;

function setI18nLanguage(locale: SupportedLocale) {
	i18n.global.locale.value = locale;
	document.querySelector('html')!.setAttribute('lang', locale)
}

export const i18nPiniaPropertyPlugin: PiniaPlugin = ({ store }) => {
	store.i18n = markRaw(i18n.global);
	if (store.$id === 'settings') {
		watch(() => store.language, (newLang) => {
			console.log({ newLang });
			setI18nLanguage(newLang as unknown as SupportedLocale);
		}, /* { immediate: true } don't do this, as it overwrites the initialLocale */)
	}
}

export { i18n, setI18nLanguage }