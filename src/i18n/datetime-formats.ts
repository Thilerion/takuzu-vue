import type { IntlDateTimeFormat } from "vue-i18n";
import type { SupportedLocale } from "./constants.js";

export const datetimeFormats: Record<SupportedLocale, IntlDateTimeFormat> = {
	'en': {
		'long': {
			year: 'numeric', month: 'long', weekday: 'short', day: 'numeric',
			hour: 'numeric', minute: 'numeric', second: 'numeric'
		}
	},
	'nl': {
		'long': {
			year: 'numeric', month: 'long', weekday: 'short', day: 'numeric',
			hour: 'numeric', minute: 'numeric', second: 'numeric'
		}
	}
}