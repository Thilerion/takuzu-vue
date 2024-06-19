<template>
<div>
	<LineCompletionsLineMarkup
		v-if="result != null"
		:line="resultDetailed!"
	/>

	<slot
		v-else-if="input != null && result == null"
		name="invalid"
	/>
	<slot
		v-else
		name="fallback"
	/>
</div>
</template>

<script setup lang="ts">
import { EMPTY } from '@/lib/constants.js';
import type { PuzzleValueLine, PuzzleValueLineStr } from '@/lib/types.js';
import { computed } from 'vue';
import type { PuzzleLineMarkupDetails } from './LineCompletionsLineMarkup.vue';

const props = defineProps<{
	input: null | PuzzleValueLineStr,
	result: null | PuzzleValueLine
}>();

const resultDetailed = computed(() => {
	if (props.result == null || props.input == null) return null;
	const inp = props.input;
	return props.result.map((ch, idx) => {
		const inpCh = inp[idx];
		const res: PuzzleLineMarkupDetails = {
			emphasis: 'base',
			value: ch,
			index: idx
		}
		if (inpCh === EMPTY && ch !== EMPTY) res.emphasis = 'high';
		else if (ch !== EMPTY && inpCh === ch) res.emphasis = 'low';
		else if (ch === EMPTY) res.emphasis = 'veryLow';
		return res;
	})
})
</script>