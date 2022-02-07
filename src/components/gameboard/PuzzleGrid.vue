<template>
	<div
		class="puzzle-grid"
		:class="[`cell-theme-${cellTheme}`, `cell-theme-type-${cellThemeType}`]"
	>
		<FastPuzzleCellWrapper
			v-for="cell in cellData"
			:key="cell.key"
			@toggle="cellClick"
			v-bind="cell"
			:value="grid[cell.y][cell.x]"
			:locked="lockedCells[cell.key]"
			:incorrect="incorrectCellKeys[cell.key]"
		>
			<template v-slot="cellProps">
				<FastPuzzleCellColored v-if="cellThemeType === 'colored'" v-bind="cellProps"/>
				<FastPuzzleCellSymbol v-else-if="cellThemeType === 'symbols'" v-bind="cellProps"/>
				<div v-else>{{cellProps.value}}</div>
			</template>
		</FastPuzzleCellWrapper>
		<PuzzleGridHighlights />
	</div>
</template>

<script>
import PuzzleCellSymbols from '@/components/gameboard/PuzzleCellSymbols.vue';
import PuzzleCellColored from '@/components/gameboard/PuzzleCellColored.vue';
import PuzzleGridHighlights from '@/components/gameboard/PuzzleGridHighlights.vue';
import { EMPTY } from '@/lib/constants.js';
import { computed, provide, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import { useTapVibrate } from '@/composables/use-tap-vibrate.js';
import FastPuzzleCellWrapper from './cell/FastPuzzleCellWrapper.vue';
import FastPuzzleCellColored from './cell/FastPuzzleCellColored.vue';
import FastPuzzleCellSymbol from './cell/FastPuzzleCellSymbol.vue';

export default {
	components: {
    PuzzleCellSymbols,
    PuzzleCellColored,
    PuzzleGridHighlights,
    FastPuzzleCellWrapper,
    FastPuzzleCellColored,
    FastPuzzleCellSymbol,
},
	props: {
		board: {
			type: Object,
			required: true,
		},
		rows: {
			type: Number,
			required: true
		},
		columns: {
			type: Number,
			required: true
		},
		paused: Boolean,
	},
	emits: ['toggle-cell'],
	setup(props) {
		const store = useStore();
		const initialGrid = store.state.puzzle.initialBoard.grid;

		let { cellData, nRows, nCols, nCells, lockedCells, coords } = useGridData(props.columns, props.rows, initialGrid);

		const shouldEnableVibration = computed(() => store.state.settings.enableVibration);
		const vibrationStrengthSetting = computed(() => store.state.settings?.vibrationStrength ?? 25);

		const delay = ref(0);
		if (nCells > (12 * 11)) {
			delay.value = 15;
		} else if (nCells > (9 * 8)) {
			delay.value = 5;
		}

		const {
			isEnabled: vibrationEnabled,
			vibrate,
		} = useTapVibrate({ pattern: vibrationStrengthSetting, delay: delay.value, enable: shouldEnableVibration });

		const { cellTheme, cellThemeType } = provideCellTheme();

		return {
			cellData,
			coords,
			nRows,
			nCols,
			lockedCells,
			numCells: nCells,
			debouncedVibrate: vibrate,
			vibrationEnabled,
			vibrate,
			cellTheme,
			cellThemeType
		}
	},
	computed: {
		grid() {
			return this.board.grid;
		},
		gridValues() {
			return this.coords.reduce((acc, { x, y, key }) => {
				acc[key] = this.grid[y][x];
				return acc;
			}, {});
		},
		incorrectCellKeys() {
			const result = {};
			this.incorrectMarkedCells.forEach(key => {
				result[key] = true;
			})
			return result;
		},
		cellComponent() {
			return this.cellThemeType === 'colored' ? 'PuzzleCellColored' : 'PuzzleCellSymbols';
		},
		vibrateOnTap() {
			return this.$store.state.settings.enableVibration;
		},
		incorrectMarkedCells() {
			return this.$store.state.puzzle.assistance.incorrectCheck.currentMarked;
		},
	},
	methods: {
		cellClick({ x, y, value }) {
			this.vibrate();
			this.$emit('toggle-cell', { x, y, value });
		},
	},
};

function provideCellTheme() {
	const store = useStore();

	const cellThemeValue = computed(() => store.state.settings.cellTheme);
	const cellThemeType = computed(() => store.getters['settings/cellThemeType']);

	const cellTheme = reactive({
		value: cellThemeValue,
		type: cellThemeType
	})

	provide('cellTheme', cellTheme);

	return { cellTheme: cellThemeValue, cellThemeType };
}

function useGridData(width, height, initialGrid) {
	const staticCellData = [];
	const lockedCells = {};
	const coords = [];


	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const key =  `${x},${y}`;
			const initialValue = initialGrid[y][x];
			const locked = initialValue !== EMPTY;
			staticCellData.push({ x, y, key, locked, initialValue });
			coords.push({ x, y, key });
			lockedCells[key] = locked;
		}
	}

	return {
		nRows: height,
		nCols: width,
		nCells: width * height,
		cellData: staticCellData,
		coords,
		lockedCells
	}
}
</script>

<style scoped>
.puzzle-grid {
	--cell-size-total:  calc(var(--cell-size) - var(--grid-gap));
	grid-area: puzzle-grid;
	grid-template-rows: repeat(var(--rows), var(--cell-size-total));
	grid-template-columns: repeat(var(--columns), var(--cell-size-total));
	@apply mr-auto mb-auto grid relative justify-items-stretch items-stretch;
	gap: var(--grid-gap);
}
.puzzle-paused .puzzle-grid, .puzzle-finished .puzzle-grid {
	@apply pointer-events-none;
}

.puzzle-cell-wrapper {
	position: relative;
}

.cell-bg {
	@apply z-0 absolute w-full h-full;
	@apply bg-gray-200 bg-opacity-90 dark:bg-gray-700 dark:bg-opacity-50;
}

.touch-anim-el {
	@apply absolute inset-0 pointer-events-none w-full h-full z-30 ring-2 ring-gray-700 opacity-100;
}
.touch-anim-enter-active {
	/* transition: opacity .1s ease; */
}
.touch-anim-leave-active {
	/* transition: opacity 1s ease .4s; */
}
.touch-anim-leave-to, .touch-anim-enter-from {
	/* opacity: 0; */
}

.incorrect-mark {
	@apply absolute inset-0 text-black flex items-center justify-center pointer-events-none leading-none w-full h-full overflow-hidden opacity-60;
}
.incorrect-mark > div {
	width: 2px;
	height: 200%;
	@apply bg-black transform -rotate-45 -translate-x-px;
}
.incorrect-mark > div:first-child {
	@apply rotate-45 translate-x-px;
}
.mark-fade-leave-active {
	transition: none
}
.mark-fade-leave-active {
	transition: opacity .2s ease;
}
.mark-fade-leave-to, .mark-fade-enter-from {
	opacity: 0;
}
</style>