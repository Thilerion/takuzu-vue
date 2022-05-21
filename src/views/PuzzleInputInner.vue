<template>
		<main class="pt-4 gap-y-4 grid bleed-grid-4 v-grid-bleed text-sm">
			<GridControls
				class="bg-white rounded px-4 pt-4 pb-2 shadow"
				@reset="resetGridValues"
				@set-dimensions="(w, h) => updatePuzzleGridBase(w, h)"
				v-model="config"
			/>

			<div class="bg-white rounded px-1 py-4 shadow full-bleed">
				<div class="mb-2 px-2">
				<label>
					<input type="checkbox" v-model="toggleInputMode">
					Use toggle input mode
				</label>
				</div>
				
				<PuzzleInputTable
					v-if="puzzleGridBase && puzzleGridBase?.[0] != null"
					:grid="puzzleGridBase"
					@set-value="({ x, y, value}) => puzzleGridBase[y][x] = value"
				>
					<template v-slot="{ x, y, index }">
						<PuzzleInputField
							v-model="puzzleGridBase[y][x]"
							@skip-focus="(val) => skipFocusFrom(val, { x, y, index })"
							@set-multiple="(val) => setMultipleValuesFromString(val, { x, y, index })"
							inputmode="numeric"
							enterkeyhint="next"
							:ref="(el) => setRef(el, { x, y, index })"
							:index="index"
							:disabled="toggleInputMode"
							:class="{
								'bg-blue-100': puzzleGridBase[y][x] === '0',
								'bg-red-100': puzzleGridBase[y][x] === '1',
							}"
						/>
						<button
							class="absolute top-0 left-0 z-20 w-full h-full touch-manipulation"
							@click="toggleValue(x, y, index)"
							v-if="toggleInputMode"
						></button>
					</template>
				</PuzzleInputTable>

				<div class="py-4 px-0.5">
				<BaseButton
					@click="showPuzzleStrings = !showPuzzleStrings"
					class="w-full -mb-0.5 transition-colors duration-500"
					:class="{
						'!rounded-b-none': showPuzzleStrings,
						'!bg-gray-100': !showPuzzleStrings
					}"
				>
					<div class="w-full flex justify-between">
						<span>Puzzle strings</span>
						<icon-ic-outline-keyboard-arrow-down class="ml-auto transition-transform duration-500" :class="{
							'rotate-180': showPuzzleStrings
						}" />
					</div>
				</BaseButton>
				<ExpandTransition @after-enter="scrollToPuzzleStrings" :duration="200">
					<div v-show="showPuzzleStrings" ref="puzzleStringsEl">
				<div class="pt-2 w-full flex flex-col px-3 gap-y-2 box-border border border-gray-200 border-t-transparent pb-3 rounded-b">
					<div>Short</div>
					<div class="max-w-full text-sm pr-1 pl-2 py-2 bg-gray-100 rounded mb-2">
						<BaseButton class="float-right ml-2 mb-0.5 px-2 py-2 my-auto rounded border inline-block w-24" @click="copyShortStr">{{copyShortSuccess ? 'Copied!' : 'Copy'}}</BaseButton>
						<p class="break-all font-mono">{{puzzleGridStrShort}}</p>
					</div>
					<div>Long</div>
					<div class="max-w-full text-sm pr-1 pl-2 py-2 bg-gray-100 rounded">
						<BaseButton class="float-right ml-2 mb-0.5 px-2 py-2 my-auto rounded border inline-block w-24" @click="copyLongStr">{{copyLongSuccess ? 'Copied!' : 'Copy'}}</BaseButton>
						<p class="break-words font-mono">{{puzzleGridStrLongFormatted}}</p>
					</div>
				</div>
				</div>
				</ExpandTransition>
				</div>
			</div>
		</main>
</template>

<script setup>
import { computed, onBeforeUpdate, onMounted, ref, watchEffect, watch, reactive } from 'vue';
import PuzzleInputTable from '@/components/puzzle-input/PuzzleInputTable.vue';
import PuzzleInputField from '@/components/puzzle-input/PuzzleInputField.vue';
import { EMPTY, ONE, ZERO } from '@/lib/constants';
import { useSharedPuzzleToggle } from '@/composables/use-puzzle-toggle';
import GridControls from '../components/puzzle-input/GridControls.vue';
import { refAutoReset, useClipboard, useSessionStorage, useStorage } from '@vueuse/core';
import { puzzleGridToString, puzzleStringToGrid, shortenPuzzleString } from '@/components/puzzle-input/convert';
import { chunk } from '@/utils/array.utils';
import ExpandTransition from './transitions/ExpandTransition.vue';

const config = useSessionStorage('takuzu_puzzle-input-config', {
	width: 10,
	height: 10,
	forceSquareGrid: false
}, {
	deep: true,
	writeDefaults: true,	
});

const width = computed(() => puzzleGridBase.value?.[0]?.length ?? 0);
const height = computed(() => puzzleGridBase.value?.length ?? 0);
const gridDimensions = computed(() => {
	return {
		width: width.value,
		height: height.value
	}
})

const puzzleGridBase = useSessionStorage('takuzu_puzzle-input-grid', [], {
	deep: true,
	writeDefaults: false,
	serializer: {
		read(v) {
			if (!v) return null;
			try {
				const parsed = JSON.parse(v);
				if (!Array.isArray(parsed) || !Array.isArray(parsed?.[0])) {
					return null;
				}
				return parsed;
			} catch(e) {
				console.warn(e);
				console.warn('Could not read input grid from storage');
				return null;
			}
		},
		write(v) {
			if (!Array.isArray(v)) return "";
			const height = v?.length
			const width = v?.[0]?.length;
			if (!height || !width) return "";
			return JSON.stringify(v);
		}
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
const showPuzzleStrings = ref(false);
const puzzleStringsEl = ref(null);
const scrollToPuzzleStrings = () => {
	const el = puzzleStringsEl.value;
	el?.scrollIntoView?.({
		behavior: 'smooth'
	})
}
const puzzleGridStrLong = computed(() => {
	if (!isValidPuzzleGrid.value) return '';
	const grid = puzzleGridBase.value;
	const dimensions = { width: config.value.width, height: config.value.height };
	return puzzleGridToString(grid, dimensions, { shorten: false });
})
const puzzleGridStrShort = computed(() => {
	if (!isValidPuzzleGrid.value) return '';
	const dimensions = { width: config.value.width, height: config.value.height };
	return shortenPuzzleString(puzzleGridStrLong.value, dimensions, { padEnd: false });
})
const puzzleGridStrLongFormatted = computed(() => {
	const value = puzzleGridStrLong.value;
	const chunked = chunk(value.split(''), gridDimensions.value.width).map(row => row.join('')).join(' ');
	return chunked;
})
const copyValueToClipboard = async (value = '') => {
	try {
		await navigator.clipboard.writeText(value);
		return true;
	} catch(e) {
		console.warn(e);
		return false;
	}
	
}
const copyShortSuccess = refAutoReset(false, 4000);
const copyLongSuccess = refAutoReset(false, 4000);
const copyShortStr = () => {
	copyValueToClipboard(puzzleGridStrShort.value).then(() => {
		copyShortSuccess.value = true;
	}).catch(() => copyShortSuccess.value = false);
}
const copyLongStr = () => {
	copyValueToClipboard(puzzleGridStrLong.value).then(() => {
		copyLongSuccess.value = true;
	}).catch(() => copyLongSuccess.value = false);
}

const gapSize = computed(() => {
	// if (width.value < 10) return '4px';
	// if (width.value < 13) return '2px';
	return '1px';
})

const xyToIndex = (x, y) => {
	return y * width.value + x;
}
const indexToXY = (index) => {
	const x = index % width.value;
	const y = Math.floor(index / width.value);
	return { x, y };
}

const toggleInputMode = ref(false);

const createEmptyPuzzleGrid = (width, height) => {
	const w = width ?? config.value.width;
	const h = height ?? config.value.height;
	return Array(h).fill(null).map(() => Array(w).fill(''));	
}
const resetGridValues = (width, height) => {
	const w = width ?? config.value.width;
	const h = height ?? config.value.height;
	const grid = createEmptyPuzzleGrid(w, h);
	puzzleGridBase.value = grid;
}
const { toggle } = useSharedPuzzleToggle();
const toggleValue = (x, y, index) => {
	let current = puzzleGridBase.value[y][x];
	if (current !== ONE && current !== ZERO) {
		current = EMPTY;
	}
	let value = toggle(current);
	if (value === EMPTY) value = '';
	puzzleGridBase.value[y][x] = value;
}

const updatePuzzleGridBase = (w = width.value, h = height.value) => {	
	let base = puzzleGridBase.value ?? [];

	let arrCopy = base.map(r => [...r]);
	const diffHeight = h - base.length;
	
	if (diffHeight < 0) {
		arrCopy.splice(diffHeight, -diffHeight);
	} else if (diffHeight > 0) {
		arrCopy.push(...Array(diffHeight).fill(' ').map(() => Array(w).fill('')));
	}

	arrCopy = arrCopy.map(row => {
		if (!Array.isArray(row)) {
			return Array(w).fill(' ');
		}
		const rowWidth = row.length;
		if (rowWidth > w) {
			return row.slice(0, w);
		} else if (rowWidth < w) {
			const r2 = [...row, ...Array(w - rowWidth).fill('')];
			return r2;
		} else return [...row];
	})
	puzzleGridBase.value = arrCopy;
}

const els = ref([]);
onBeforeUpdate(() => {
	els.value = [];
})
const setRef = (el, { index }) => {
	const el2 = el?.el;
	if (!el2) return;
	els.value[index] = el2;
}

const skipFocusFrom = (amount, {x, y, index}) => {
	const focusTo = index + amount;
	const emptyAmount = amount - 1;
	for (let gy = y, i = 0; gy < height.value; gy++) {
		for (let gx = x; gx < width.value; gx++, i++) {
			
			if (i <= emptyAmount) {
				puzzleGridBase.value[gy][gx] = '';
				console.log('setting empty');

				
			};
			if (i === emptyAmount) {
				const el = els.value[focusTo];
				el?.focus?.();
				return;
			}
		}
	}
}

const isMultipleEmptyValues = (str) => {
	if (str.length < 1) return false;
	const num = parseInt(str, 10);
	if (Number.isNaN(num) || !num || num <= 1) {
		return false;
	}
	return num;
}

const setValueWithIndex = (value, index) => {
	const { x, y } = indexToXY(index);
	if (x >= width.value || y >= height.value) return;
	puzzleGridBase.value[y][x] = value;
}

const setFocusToCell = (idx, currentIdx) => {
	const el = els.value[idx];
	if (!el) {
		if (currentIdx != null) {
			const curEl = els.value[currentIdx];
			curEl.blur();
		}
		return;
	}
	el.focus();
}

const setMultipleValuesFromString = (values = '', { index }) => {
	console.log({values})
	const parsedValues = values.flatMap(v => {
		if (v === ONE || v === ZERO) {
			return v;
		} else if (v === EMPTY || v === ' ') {
			return '';
		}
		const emptyValues = isMultipleEmptyValues(v);
		if (emptyValues) {
			return Array(emptyValues).fill(EMPTY);
		}
		return [];
	})
	for (let i = 0; i < parsedValues.length; i++) {
		const value = parsedValues[i];
		setValueWithIndex(value, index + i);
	}
	setFocusToCell(index + parsedValues.length, index);
}
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