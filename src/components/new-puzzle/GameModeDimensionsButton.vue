<template>
	<button
		class="bg-gray-50 dark:bg-slate-700 dark:border-slate-600 border rounded w-1/6 text-sm relative transition-colors"
		:class="[tall ? 'tall' : 'square', { selected }]"
	>
	<div class="inner" v-if="true">{{width}}<small class="opacity-70 text-xs px-px">x</small>{{height}}</div>
	</button>
</template>

<script setup lang="ts">
import type { BoardShape } from '@/lib/types.js';

export type GameModeDimensionsButtonProps = BoardShape & {
	tall?: boolean,
	selected?: boolean
}

const props = defineProps<GameModeDimensionsButtonProps>();
</script>

<style scoped>
.tall {
	aspect-ratio: 0.85;
}
.square {
	aspect-ratio: 1;
}

.selected {
	@apply bg-teal-600 border-teal-700 text-white;
}

button > .inner {
	@apply flex flex-row items-center justify-center gap-px;
}
</style>