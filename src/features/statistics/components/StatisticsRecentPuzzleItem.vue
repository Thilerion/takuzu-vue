<template>
<li>
	<div v-if="daysDiff < 2">{{ dateFormattedRelative }}</div>
	<div v-else>{{ date.toLocaleDateString(intlLocaleList, { dateStyle: 'short' }) }}</div>
	<div class="pl-2 mr-auto">{{ date.toLocaleTimeString(intlLocaleList, { timeStyle: 'short' }) }}</div>
	<div class="text-center">{{ dimensions }}</div>
	<div class="text-center">{{ difficulty }}*</div>
	<div class="text-end">{{ formattedTime }}</div>
</li>
</template>

<script setup lang="ts">
import type { DifficultyKey } from '@/lib/types.js';
import { differenceInCalendarDays } from 'date-fns';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { useNow } from '@vueuse/core';
import { toRef } from 'vue';
import { useFormattedDurationNarrow } from '../composables/format-duration.js';

const props = defineProps<{
	date: Date,
	dimensions: string,
	difficulty: DifficultyKey,
	time: number
}>();

const today = useNow({
	interval: 20_000, /* every 20 seconds */
})
// TODO: relative time format in days (1 or 2), or hours (if today), or minutes (if this hour and more than 15 minutes ago), or "just now"

const { locale, fallbackLocale } = useI18n();
const intlLocaleList = computed(() => {
	const list: string[] = [locale.value];
	if (!fallbackLocale.value || (Array.isArray(fallbackLocale.value) && !fallbackLocale.value.length)) return list;
	if (Array.isArray(fallbackLocale.value)) {
		list.push(...fallbackLocale.value);
	} else if (typeof fallbackLocale.value === 'string') {
		list.push(fallbackLocale.value);
	}
	return list;
})
const rtfFormatter = computed((): Intl.RelativeTimeFormat => {
	return new Intl.RelativeTimeFormat(intlLocaleList.value, {
		localeMatcher: 'best fit',
		numeric: 'auto',
		style: 'long'
	})
})
const formatDateRelative = (diffDays: number) => {
	return rtfFormatter.value.format(-diffDays, 'days');
}
const dateFormattedRelative = computed(() => formatDateRelative(daysDiff.value));

const daysDiff = computed(() => differenceInCalendarDays(today.value, props.date));

// TODO: if 0 minutes, only show "{n}s"
const timeMs = toRef(props, 'time');
const formattedTime = useFormattedDurationNarrow(timeMs);
</script>