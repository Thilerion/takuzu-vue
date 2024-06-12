<template>
<div ref="tableWrapperEl" class="flex justify-center max-w-full max-h-full overflow-hidden">
	<div class="relative border-2 border-slate-800 inline-block">
		<table
			class="table-fixed mx-auto border-0 w-full"
			:style="{ maxWidth: maxTableWidth, minWidth: minTableWidth }"
		>
			<tbody>
				<tr
					v-for="(row, y) in grid"
					:key="`row-${y}`"
				>
					<td
						v-for="(cellValue, x) in row"
						:key="`col-${x}`"
						class="overflow-clip border border-slate-700 relative bg-gray-50 p-px text-center align-middle"
					>
						<div class="cell-wrapper aspect-square flex items-center justify-center relative -m-0.5">
							<slot
								:x
								:y
								:index="vecToIndex({ x, y })"
								:value="cellValue"
							>{{ cellValue }}</slot>
						</div>						
					</td> 
				</tr>
			</tbody>
		</table>
	</div>
</div>
</template>

<script setup lang="ts">
import type { BoardShape, Vec } from '@/lib/types.js';
import type { CustomPuzzleInputGrid, CustomPuzzleInputValue } from './types.js';
import { computed, ref } from 'vue';
import { useElementSize } from '@vueuse/core';

const props = defineProps<{
	grid: CustomPuzzleInputGrid
}>();
const emit = defineEmits<{
	(e: 'update-value', v: Vec & { value: CustomPuzzleInputValue }): void
}>();
const dims = computed((): BoardShape => {
	const height = props.grid.length;
	const width = props.grid[0].length;
	return { height, width };
});
const vecToIndex = ({ x, y }: Vec) => y * dims.value.width + x;

const tableWrapperEl = ref<HTMLDivElement>();
const gridAspectRatio = computed(() => dims.value.width / dims.value.height);
const { width: wrapperWidth } = useElementSize(
	tableWrapperEl,
	{ width: window.innerWidth - 28, height: (window.innerHeight - 10) * gridAspectRatio.value },
	{ box: 'content-box' }
);
const MAX_CELL_SIZE = 80;
const MIN_CELL_SIZE = 24;

const maxTableWidth = computed(() => {
	const byCellSize = MAX_CELL_SIZE * dims.value.width;
	const byWrapper = wrapperWidth.value - 10;
	return `${Math.min(byCellSize, byWrapper)}px`;
})
const minTableWidth = computed(() => {
	return `${MIN_CELL_SIZE * dims.value.width}px`;
})
</script>

<style scoped>
.cell-wrapper {
	min-width: calc(v-bind(MIN_CELL_SIZE) * 1px);
	min-height: calc(v-bind(MIN_CELL_SIZE) * 1px);
}
</style>