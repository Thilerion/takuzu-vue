<template>
<div>
	<label class="block">
		Min:
	</label>
	<select
		v-model="minModel"
		class="mb-4"
	>
		<option
			v-for="opt in options"
			:key="opt.value"
			:value="opt.value"
		><TextStarRepeated :amount="opt.value" /><TextStarRepeated :amount="5 - opt.value" outline /> - {{ $t(`Game.difficulty.${opt.label}`, opt.label) }}</option>
	</select>
	<label class="block">
		Max:
	</label>
	<select
		v-model="maxModel"
	>
		<option
			v-for="opt in options"
			:key="opt.value"
			:value="opt.value"
		><TextStarRepeated :amount="opt.value" /><TextStarRepeated :amount="5 - opt.value" outline /> - {{ $t(`Game.difficulty.${opt.label}`, opt.label) }}</option>
	</select>
</div>
</template>

<script setup lang="ts">
import type { DifficultyKey } from '@/lib/types.js';
import { computed } from 'vue';

const props = defineProps<{
	min: DifficultyKey,
	max: DifficultyKey,
	labels: Record<DifficultyKey, string>,
}>();

const emit = defineEmits<{
	(e: 'set-min', value: DifficultyKey): void,
	(e: 'set-max', value: DifficultyKey): void,
}>();

const minModel = computed({
	get: () => props.min,
	set: (val: DifficultyKey) => {
		emit('set-min', val);
	}
})
const maxModel = computed({
	get: () => props.max,
	set: (val: DifficultyKey) => {
		emit('set-max', val);
	}
})

const options: { value: DifficultyKey, label: string }[] = [
	{ value: 1, label: props.labels[1] },
	{ value: 2, label: props.labels[2] },
	{ value: 3, label: props.labels[3] },
	{ value: 4, label: props.labels[4] },
	{ value: 5, label: props.labels[5] },
]
</script>