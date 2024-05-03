import { computed, type ComputedRef, type Ref } from "vue";
import { useI18n } from "vue-i18n";

export const useFormattedDurationNarrow = (timeMs: Ref<number>): ComputedRef<string> => {
	const durationPartsResult = computed<DurationFormattedParts>(() => {
		return getDurationParts(timeMs.value);
	});
	const { t } = useI18n();
	const message = computed(() => {
		const { type, ...parts } = durationPartsResult.value;
		switch (type) {
			case 'minutes-seconds':
				return t('Statistics.Overview.time-parts-short.minutes-seconds', parts);
			case 'hours-minutes':
				return t('Statistics.Overview.time-parts-short.hours-minutes', parts);
			case 'days-hours':
				return t('Statistics.Overview.time-parts-short.days-hours', parts);
			default: {
				const x: never = type;
				console.warn('Unexpected formattedTimeParts type', x);
				return '';
			}
		}
	})
	return message;
}

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;

type DurationFormattedParts = {
	type: "minutes-seconds";
	minutes: number;
	seconds: number;
	days?: undefined;
	hours?: undefined;
} | {
	type: "hours-minutes";
	hours: number;
	minutes: number;
	days?: undefined;
	seconds?: undefined;
} | {
	type: "days-hours";
	days: number;
	hours: number;
	minutes?: undefined;
	seconds?: undefined;
};
function getDurationParts(time: number): DurationFormattedParts {
	if (time < hour) {
		const minutes = Math.floor(time / minute);
		const seconds = Math.floor((time - (minutes * minute)) / second);
		return { type: 'minutes-seconds' as const, minutes, seconds };
	}
	if (time < hour * 150) {
		let rem = time;
		const hours = Math.floor(rem / hour);
		rem -= (hours * hour);

		const minutes = Math.floor(rem / minute);
		return { type: 'hours-minutes' as const, hours, minutes };
	}
	
	let rem = time;

	const days = Math.floor(rem / day);
	rem -= (days * day);

	const hours = Math.floor(rem / hour);

	return { type: 'days-hours' as const, days, hours }
}