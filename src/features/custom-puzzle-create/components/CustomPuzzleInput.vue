<template>
<main class="pt-4 gap-y-4 grid bleed-grid-4 v-grid-bleed text-sm">
	<div class="bg-white rounded-xl shadow-md shadow-black/5 w-full full-bleed pl-6 pr-2 pt-2 pb-2">
		<header class="flex justify-between items-center">
			<h3 class="font-bold text-gray-600 tracking-wide">Configure board</h3>
			<button
				class="flex-1 px-2 py-2 gap-x-1 text-end flex flex-row items-center justify-end transition-all"
				@click="controlsOpen = !controlsOpen"
			>
				<span v-if="!controlsOpen">Show</span><span v-else>Hide</span>
				<icon-ic-outline-keyboard-arrow-down
					class="transition-transform duration-500 text-base"
					:class="{ 'rotate-180': controlsOpen }"
				/>				
			</button>
		</header>
		<CustomPuzzleInputConfigControls
			v-model:expanded="controlsOpen"
		/>
	</div>
	
	<div
		v-if="isValidPuzzleGrid"
		class="bg-white rounded-xl shadow-md shadow-black/5 px-1 py-4 full-bleed"
	>
		<CustomPuzzleInputTable
			v-if="isValidPuzzleGrid"
			:grid="puzzleGridBase!"
		>
			<template #default="{ x, y, index }">
				<CustomPuzzleInputTableCell
					:ref="(v) => setRef(v as InstanceType<typeof CustomPuzzleInputTableCell>)"
					:model-value="puzzleGridBase![y][x]"
					:data-index="index"
					inputmode="numeric"

					@update:model-value="setGridValue(x, y, $event)"
					@to-next="() => focusCell(index + 1)"
					@to-prev="() => focusCell(index - 1)"
				/>
			</template>
		</CustomPuzzleInputTable>
	</div>
	<CustomPuzzleInputStrings :grid="isValidPuzzleGrid ? puzzleGridBase : null" />
</main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import CustomPuzzleInputTableCell from './CustomPuzzleInputTableCell.vue';
import { useCustomPuzzleInputGrid } from '../composables/custom-input-grid.js';
import { EMPTY, type PuzzleValue } from '@/lib/constants.js';
import { onBeforeMount } from 'vue';

const {
	customPuzzleGrid: puzzleGridBase,
	width, height, forceSquareGrid,
} = useCustomPuzzleInputGrid();
const setGridValue = (x: number, y: number, v: PuzzleValue) => {
	puzzleGridBase.value![y][x] = v;
}

const controlsOpen = ref(false);

onBeforeMount(() => {
	if (puzzleGridBase.value != null) {
	// If grid is empty on initial load, set it to null
	const grid = puzzleGridBase.value;
	const flat = grid.flat(3);
	if (flat.every(v => v === EMPTY)) {
		puzzleGridBase.value = null;
	}
}

	// Then, if grid is null, set controls to open
	console.log(puzzleGridBase.value);
	if (puzzleGridBase.value == null) {
		controlsOpen.value = true;
	}
})

const config = computed(() => {
	return {
		width: width.value,
		height: height.value,
		forceSquareGrid: forceSquareGrid.value,
	}
})

const isValidPuzzleGrid = computed(() => {
	const grid = puzzleGridBase.value;
	if (!Array.isArray(grid)) return false;
	if (!Array.isArray(grid[0])) return false;
	if (config.value) {
		const { width, height } = config.value;
		if (width && height) {
			if (grid.length !== height || grid[0].length !== width) return false;
		}
	}
	return true;
})

const els = ref<HTMLInputElement[]>([]);
const setRef = (val: InstanceType<typeof CustomPuzzleInputTableCell>) => {
	if (val == null) {
		els.value = [];
		return;
	}
	if (val.el) els.value.push(val.el);
}
const elsByIndex = computed(() => {
	const res = new Map<number, HTMLElement>();
	for (const el of els.value) {
		if (el) {
			const index = parseInt(el.dataset.index ?? '-1', 10);
			if (index >= 0) {
				res.set(index, el);
			}
		}
	}
	return res;
})
const focusCell = (index: number) => {
	const map = elsByIndex.value;
	if (map.has(index)) {
		map.get(index)!.focus();
	} else {
		// blur current cell instead
		const activeEl = document.activeElement;
		if (activeEl && 'dataset' in activeEl && (activeEl as HTMLElement).dataset.index != null) {
			(activeEl as HTMLElement).blur();
		}
	}
}
</script>

<style scoped>
.double-border-right {
	@apply border-r-2 -mr-0.5 border-r-gray-400 z-10 relative;
}

.double-border-bottom {
	@apply border-b-2 -mb-0.5 border-b-gray-400 z-10 relative;
}

.double-border-right.double-border-bottom {
	@apply z-20;
}

.v-grid-bleed {
	grid-template-columns: 1fr min(calc(100vw - 2 * var(--basePadding, 1rem)), 44rem) 1fr;
}
.v-grid-bleed>* {
	grid-column: 2 / span 1;
}
.v-grid-bleed>.full-bleed {
	grid-column: 1 / -1;
}
.bleed-grid-2 {
	--basePadding: theme(padding.2);
}
.bleed-grid-4 {
	--basePadding: theme(padding.4);
}
.bleed-grid-6 {
	--basePadding: theme(padding.6);
}
</style>../composables/custom-input-grid.js