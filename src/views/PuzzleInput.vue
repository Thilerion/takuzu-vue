<template>
	<div class="flex flex-col pb-4 overflow-x-hidden fixed inset-0 overscroll-y-auto">
		<PageHeader :transparent="false" small elevated class="flex-shrink-0">Puzzle Input</PageHeader>
		<div class="flex-1 flex flex-col">
		<main class="pt-4 gap-y-4 grid bleed-grid-4 v-grid-bleed text-sm">
			<div class="bg-white rounded px-4 pt-4 pb-2 shadow">
				<div class="flex flex-row gap-x-4">
					<div class="flex flex-col">
						<label for="widthInput">Width</label>
						<input type="number" v-model="width" name="width" id="widthInput" min="4" max="16" class="p-2 text-sm min-w-[3.5rem] min-h-8 rounded border-gray-400">
					</div>
					<div class="self-end py-2">x</div>
					<div class="flex flex-col">
						<label for="heightInput">Height</label>
						<input type="number" v-model="height" name="height" id="heightInput" min="4" max="16" class="p-2 text-sm min-w-[3.5rem] min-h-[2rem] rounded border-gray-400 disabled:text-gray-600 disabled:bg-gray-100 disabled:border-gray-400/70" :disabled="forceSquareGrid">
					</div>
				</div>
				<label class="py-2 inline-flex items-center gap-x-2 text-sm">
					<input type="checkbox" name="squareGrid" id="squareGridToggle" @input="setSquareGridToggle($event.target.checked)" :checked="forceSquareGrid">
					Force square grid
				</label>
			</div>

			<div class="bg-white rounded px-1 py-4 pt-6 shadow full-bleed">
				<PuzzleInputTable
					v-if="puzzleGridBase && puzzleGridBase?.[0] != null"
					:grid="puzzleGridBase"
					@set-value="({ x, y, value}) => puzzleGridBase[y][x] = value"
				/>
				<div class="mini-puzzle-grid flex flex-col dynamic-gap text-xxs" v-if="false">
					<div
						class="flex flex-row dynamic-gap"
						v-for="(row, y) in puzzleGridBase"
						:key="y"
					>
						<div
							class="min-h-[13px] min-w-[13px] flex-1 bg-gray-50 border flex items-center justify-center aspect-square border-gray-400 -m-px"
							:class="{
								'double-border-right': x === doubleBorderRight,
								'double-border-bottom': y === doubleBorderBottom
							}"
							v-for="(cell, x) in row"
							:key="x"
						>
							<input type="text" v-model="puzzleGridBase[y][x]" class="min-h-[13px] min-w-[13px] p-0 m-0 border-0 bg-transparent focus:border-0 focus:ring-0 text-center text-xs text-[11px] h-full w-full aspect-square flex align-middle">
						</div>
					</div>
				</div>
			</div>
		</main>
		</div>
	</div>
</template>

<script setup>
import { useDebounceFn } from '@vueuse/core';
import { computed, onMounted, ref, watch } from 'vue';
import PuzzleInputTable from '@/components/puzzle-input/PuzzleInputTable.vue';

const width = ref(10);
const height = ref(10);
const forceSquareGrid = ref(true);
const setSquareGridToggle = (value) => {
	forceSquareGrid.value = value;
	if (value) {
		height.value = width.value;
	}
}
const gapSize = computed(() => {
	// if (width.value < 10) return '4px';
	// if (width.value < 13) return '2px';
	return '1px';
})

const puzzleGridBase = ref([]);
const doubleBorderRight = computed(() => {
	if (puzzleGridBase.value.length < 6) return null;
	const width = puzzleGridBase.value[0].length;
	if (width < 6) return null;
	if (width % 2 === 1) return null;
	return (width / 2 - 1);
})
const doubleBorderBottom = computed(() => {
	const height = puzzleGridBase.value.length;
	if (height < 6) return null;
	if (height % 2 === 1) return null;
	return (height / 2 - 1);
})
const updatePuzzleGridBase = (w, h) => {
	if (w < 4) {
		width.value = 4;
	} else if (w > 16) {
		width.value = 16;
	}
	if (h < 4) {
		height.value = 4;
	} else if (h > 16) {
		height.value = 16;
	}
	if (forceSquareGrid.value && width.value !== height.value) {
		height.value = width.value;
	}
	if (width.value !== w || height.value !== h) {
		return;
	}
	/* const arr = Array(h).fill(null).map(() => Array(w).fill(null));
	puzzleGridBase.value = arr; */

	let arrCopy = puzzleGridBase.value.map(r => [...r]);
	const diffHeight = h - puzzleGridBase.value.length;
	
	if (diffHeight < 0) {
		arrCopy.splice(diffHeight, -diffHeight);
	} else if (diffHeight > 0) {
		arrCopy.push(...Array(diffHeight).fill(null).map(() => Array(w).fill(null)));
	}

	arrCopy = arrCopy.map(row => {
		if (!Array.isArray(row)) {
			return Array(w).fill(null);
		}
		const rowWidth = row.length;
		if (rowWidth > w) {
			return row.slice(0, w);
		} else if (rowWidth < w) {
			const r2 = [...row, ...Array(w - rowWidth).fill(null)];
			return r2;
		} else return [...row];
	})
	puzzleGridBase.value = arrCopy;
}
onMounted(() => updatePuzzleGridBase(width.value, height.value));
const debounceUpdatePuzzleGridBase = useDebounceFn(updatePuzzleGridBase, 500);
watch([width, height], ([w, h]) => {
	debounceUpdatePuzzleGridBase(w, h);
})
</script>

<style scoped>
.bleed-grid-2 {
	--basePadding: theme(padding.2);
}
.bleed-grid-4 {
	--basePadding: theme(padding.4);
}
.bleed-grid-6 {
	--basePadding: theme(padding.6);
}
.v-grid-bleed {
	grid-template-columns: 1fr min(calc(100vw - 2 * var(--basePadding, 1rem)), 44rem) 1fr;
}
.v-grid-bleed > * {
	grid-column: 2 / span 1;
}
.v-grid-bleed > .full-bleed {
	grid-column: 1 / -1;
}

.dynamic-gap {
	gap: v-bind(gapSize);
}

.double-border-right {
	@apply border-r-2 -mr-0.5 border-r-gray-400 z-10 relative;
}
.double-border-bottom {
	@apply border-b-2 -mb-0.5 border-b-gray-400 z-10 relative;
}
.double-border-right.double-border-bottom {
	@apply z-20;
}
</style>