<template>
	<PuzzleHintBase @hide="$emit('hide')">
		<template #title>
			{{hint.title}}: <small class="text-sm opacity-80">{{hint.subtitle}}</small>
		</template>
		<template #message>
			{{ message }}
		</template>
		<template #buttons>
			<button disabled class="text-sm text-slate-700 bg-white border-r min-w-fit w-24 py-1 flex-grow max-w-[27%] disabled:text-slate-400 disabled:bg-slate-50">&#x3C; Back</button>
			<button class="text-sm min-w-fit flex-grow-[4] w-24 max-w-[50%]">Learn more</button>
			<button @click="onActionBtn" class="text-sm flex-grow text-slate-700 bg-white border-l min-w-fit w-24 py-1 max-w-[27%]">{{actionLabel ?? 'Apply'}} &#x3E;</button>
		</template>
	</PuzzleHintBase>
</template>

<script setup lang="ts">
import type { Hint } from '@/stores/hints/Hint.js';
import { computed, toRef } from 'vue';

const emit = defineEmits<{
	(e: 'hide'): void;
	(e: 'done'): void;
}>();
const props = defineProps<{
	hint: Hint
}>()
const hint = toRef(props, 'hint');

const actions = computed(() => hint.value.actions ?? []);
const message = computed(() => hint.value.message);

const action = computed(() => {
	if (actions.value?.length) {
		return actions.value[0];
	}
	return null;
})
const actionLabel = computed(() => {
	return action.value?.label;
})
const hasActionFn = computed(() => {
	return action.value?.fn != null;
})
const onActionBtn = () => {
	if (hasActionFn.value) {
		action.value!.fn(hint.value);
	}
	emit('done');
}
</script>

<style scoped>
</style>