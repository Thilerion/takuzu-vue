<template>
<div class="hint w-full inset-x-0 bottom-0 h-full flex items-end">
	<section
		class="hint-inner
		max-h-32
		bg-white dark:bg-slate-700 text-slate-900 dark:text-white
		w-full text-sm flex flex-col
		pointer-events-auto flex-1 min-h-[6.5rem]
		"
	>
		<header class="flex text-sm bg-slate-100/0 items-center pl-4 pr-1.5 h-7 min-h-fit">
			<h1>{{hint.title}}: <small class="text-sm opacity-80">{{hint.subtitle}}</small></h1>
			<IconBtn
				scale="1"
				class="h-full !p-0 aspect-square ml-auto"
				@click="$emit('hide')"
			><icon-ic-baseline-close />
			</IconBtn>
		</header>
		<div
			class="pl-4 pr-2 my-auto min-h-[4em] w-full flex-1 flex justify-stretch items-start flex-col text-xs leading-[1.5] overflow-x-hidden overflow-y-auto max-h-full h-full"
		>
			<!-- Normally, space for max 3 lines -->
			<p class="my-auto">{{message}}</p>
		</div>
		<div class="min-h-fit sticky bottom-0 mt-0.5 flex h-9 items-stretch border-t w-full">
			<button disabled class="text-sm text-slate-700 bg-white border-r min-w-fit w-24 py-1 flex-grow max-w-[27%] disabled:text-slate-400 disabled:bg-slate-50">&#x3C; Back</button>
			<button class="text-sm min-w-fit flex-grow-[4] w-24 max-w-[50%]">Learn more</button>
			<button @click="onActionBtn" class="text-sm flex-grow text-slate-700 bg-white border-l min-w-fit w-24 py-1 max-w-[27%]">{{actionLabel ?? 'Apply'}} &#x3E;</button>
		</div>
		
	</section>
</div>
</template>

<script setup lang="ts">
import type { Hint } from '@/stores/hints/Hint.js';
import { computed, toRef } from 'vue';

const emit = defineEmits(['hide', 'done']);
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
.hint-inner {
	box-shadow: 0 5px 10px 10px rgba(0,0,0,0.03), 0 3px 3px 3px rgba(0,0,0,0.05);
}
</style>