<template>
<div class="flex justify-center max-w-full max-h-full overflow-hidden">
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
						<div class="table-cell-wrapper aspect-square flex items-center justify-center relative -m-0.5">
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
import type { PuzzleValue } from '@/lib/constants.js';
import type { BoardShape, PuzzleGrid, Vec } from '@/lib/types.js';
import { computed } from 'vue';

const props = defineProps<{
	grid: PuzzleGrid
}>();
const emit = defineEmits<{
	(e: 'update-value', v: Vec & { value: PuzzleValue }): void
}>();
const dims = computed((): BoardShape => {
	const height = props.grid.length;
	const width = props.grid[0].length;
	return { height, width };
});
const vecToIndex = ({ x, y }: Vec) => y * dims.value.width + x;

const MAX_CELL_SIZE = 80;
const MIN_CELL_SIZE = 16;

const maxTableWidth = computed(() => {
	return `${MAX_CELL_SIZE * dims.value.width}px`;
})
const minTableWidth = computed(() => {
	return `${MIN_CELL_SIZE * dims.value.width}px`;
})
</script>

<style scoped>
.table-cell-wrapper {
	min-width: calc(v-bind(MIN_CELL_SIZE) * 1px);
	min-height: calc(v-bind(MIN_CELL_SIZE) * 1px);
	container-type: inline-size;
}

@container (width < 25px) {
	:slotted(.table-cell-wrapper > *) {
		@apply text-sm;
	}
}
@container (width > 50px) {
	:slotted(.table-cell-wrapper > *) {
		@apply text-xl;
	}
}
</style>