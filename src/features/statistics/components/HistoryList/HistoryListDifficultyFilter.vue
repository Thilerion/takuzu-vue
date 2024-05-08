<template>
<select
	v-model="modelValue"
	class="w-full text-sm"
>
	<option 
		v-for="opt in difficultyOptions"
		:key="opt.value ?? 'any'"
		:value="opt.value"
	><span v-if="opt.value != null">{{ opt.value }}* - </span>{{ opt.label }}</option>
</select>
</template>

<script setup lang="ts">
import { DIFFICULTY_LABELS } from '@/config.js';
import type { DifficultyKey } from '@/lib/types.js';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const modelValue = defineModel<DifficultyKey | null>({ required: true });
defineProps<{
	id: string
}>();

const { t } = useI18n();
const difficultyOptions = computed(() => {
	const keys = Object.keys(DIFFICULTY_LABELS) as any[] as DifficultyKey[];
	const result: { value: DifficultyKey | null, label: string }[] = [
		{ value: null, label: t('Statistics.History.filter.any') }
	];

	for (const key of keys) {
		const label = DIFFICULTY_LABELS[key];
		const labelMsg = t(`Game.difficulty.${label}`);
		result.push({ value: key, label: labelMsg });
	}
	return result;
});
</script>