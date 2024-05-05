import type { IntlNumberFormat } from "vue-i18n";
import type { SupportedLocale } from "./constants.js";

export const numberFormats: Record<SupportedLocale, IntlNumberFormat> = {
	'en': {
		'percent': {
			style: 'percent', useGrouping: false
		},
		'compactShort': {
			notation: 'compact', compactDisplay: 'short'
		}
	},
	nl: {
		'percent': {
			style: 'percent', useGrouping: false
		},
		'compactShort': {
			notation: 'compact', compactDisplay: 'short'
		}
	}
}