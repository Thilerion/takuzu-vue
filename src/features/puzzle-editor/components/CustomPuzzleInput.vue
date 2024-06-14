<template>
<main class="pt-4 gap-y-4 grid bleed-grid-4 v-grid-bleed text-sm">
	<div class="bg-white rounded-xl shadow-md shadow-black/5 w-full full-bleed pl-6 pr-2 pt-2 pb-2">
		<header class="flex justify-between items-center">
			<h3 class="font-bold text-gray-600 tracking-wide">{{ $t('PuzzleEditor.configure-board.title') }}</h3>
			<button
				class="flex-1 px-2 py-2 gap-x-1 text-end flex flex-row items-center justify-end transition-all"
				@click="controlsOpen = !controlsOpen"
			>
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
		class="bg-white rounded-xl shadow-md shadow-black/5 px-1 pt-4 full-bleed w-full"
	>
		<transition name="fade" mode="out-in">
			<div v-if="isValidGrid">
				<div class="mb-4 flex justify-end px-4">
					<CustomPuzzleInputTools
						v-model:toggle-input-mode="toggleInputModeEnabled"
						@clear="resetGrid"
						@rotate="rotateGrid"
					/>
				</div>
				<CustomPuzzleInputTable
					v-if="isValidGrid"
					:grid="puzzleGridBase!"
				>
					<template #default="{ x, y, index }">
						<CustomPuzzleInputTableCell
							:ref="(v) => setRef(v as InstanceType<typeof CustomPuzzleInputTableCell>)"
							:model-value="puzzleGridBase![y][x]"
							:data-index="index"
							:solution-value="singleSolution == null ? null : singleSolution![y]?.[x] ?? null"
							inputmode="numeric"

							@update:model-value="setGridValue(x, y, $event)"
							@to-next="() => focusCell(index + 1)"
							@to-prev="() => focusCell(index - 1)"
						/>
						<button
							v-if="toggleInputModeEnabled"
							class="absolute inset-0 w-full h-full touch-manipulation"
							@click="toggleCell(x, y)"
						></button>
					</template>
				</CustomPuzzleInputTable>
				<CustomPuzzleInputValidation
					class="my-4"
					:grid="puzzleGridBase"
					:dimensions="{ width, height }"
					@found-single-solution="(grid) => singleSolution = grid"
				/>
			</div>
			<div
				v-else
				class="text-center text-lg pt-4 pb-6 px-6"
			>
				{{ $t('PuzzleEditor.select-grid-dimensions-to-start') }}
			</div>
		</transition>
	</div>
	
	<div
		class="bg-white rounded-xl shadow-md shadow-black/5 w-full full-bleed pl-6 pr-2 pt-2 pb-2"
	>
		<div class="">
			<CustomPuzzleInputStrings :grid="isValidGrid ? puzzleGridBase : null" />
		</div>
	</div>
</main>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import CustomPuzzleInputTableCell from './CustomPuzzleInputTableCell.vue';
import { useCustomPuzzleInputGrid } from '../composables/custom-input-grid.js';
import type { PuzzleValue } from '@/lib/constants.js';
import { useSharedPuzzleToggle } from '@/composables/use-puzzle-toggle.js';
import type { PuzzleGrid } from '@/lib/types.js';

const {
	customPuzzleGrid: puzzleGridBase,
	width, height,
	resetGrid,
	emptyExistingGrid, isValidGrid,
	rotateGrid,
} = useCustomPuzzleInputGrid();
const setGridValue = (x: number, y: number, v: PuzzleValue) => {
	puzzleGridBase.value![y][x] = v;
}

const singleSolution = ref<PuzzleGrid | null>(null);

const toggleInputModeEnabled = ref(false);
const { toggle } = useSharedPuzzleToggle();
const toggleCell = (x: number, y: number) => {
	if (puzzleGridBase.value == null) {
		throw new Error('Cannot toggle value on "null" PuzzleGridBase');
	}
	const current: PuzzleValue = puzzleGridBase.value[y][x];
	const value = toggle(current);
	setGridValue(x, y, value);
}

const controlsOpen = ref(false);
onBeforeMount(() => {
	// If grid is empty on initial load, set it to null
	if (emptyExistingGrid.value) {
		puzzleGridBase.value = null;
	}
	// Then, if grid is null, set controls to open
	if (puzzleGridBase.value == null) {
		controlsOpen.value = true;
	}
})

const cellsByIndex = ref(new Map<number, HTMLElement>());
const setRef = (val: InstanceType<typeof CustomPuzzleInputTableCell>) => {
	if (val == null) {
		cellsByIndex.value.clear();
		return;
	}
	if (val.el) {
		const index = parseInt(val.el.dataset.index ?? '-1', 10);
		if (index >= 0) {
			cellsByIndex.value.set(index, val.el);
		}
	}
}
const focusCell = (index: number) => {
	const map = cellsByIndex.value;
	if (map.has(index)) {
		map.get(index)!.focus();
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

.fade-enter-active {
  transition: opacity .2s ease;
}
.fade-leave-active {
  transition: opacity .2s ease .2s;
}

.fade-enter-from,
.fade-leave-to, .fade-enter {
  opacity: 0;
}
</style>