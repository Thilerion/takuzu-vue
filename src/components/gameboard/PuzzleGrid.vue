<template>
	<div
		class="puzzle-grid"
		:class="[`cell-theme-${cellTheme}`, `cell-theme-type-${cellThemeType}`]"
	>
	<div
		class="puzzle-cell-wrapper overflow-hidden"
		v-for="cell in cellData"
		:key="cell.key"
		:data-x="cell.x"
		:data-y="cell.y"
		:style="{ 'grid-row': `calc(${cell.y} + 1) / span 1`,
		'grid-column': `calc(${cell.x} + 1) / span 1` }"
	>
		<component
			:is="cellComponent"
			class="cell overflow-hidden"
			@pointerdown="cellClick(cell.x, cell.y, cell.key)"
			:value="gridValues[cell.key]"
			:theme="cellTheme"
			:theme-type="cellThemeType"
			:locked="lockedCells[cell.key]"
			:hidden="false"
			:incorrect="incorrectCellKeys[cell.key]"
		>
		<template #incorrect v-if="cellThemeType === 'colored'">
			<transition name="mark-fade">
				<div class="incorrect-mark" v-if="incorrectCellKeys[cell.key]">
					<div></div>
					<div></div>
				</div>
			</transition>
		</template>
		</component>
	</div>
		<PuzzleGridHighlights />
	</div>
</template>

<script>
import PuzzleCellSymbols from '@/components/gameboard/PuzzleCellSymbols.vue';
import PuzzleCellColored from '@/components/gameboard/PuzzleCellColored.vue';
import PuzzleGridHighlights from '@/components/gameboard/PuzzleGridHighlights.vue';
import debounce from 'lodash.debounce';
import { EMPTY } from '@/lib/constants';
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
	components: {
		PuzzleCellSymbols,
		PuzzleCellColored,
		PuzzleGridHighlights,
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

		const { debouncedVibrate, vibrationEnabled, vibrate } = useTapVibrate(store, 20);

		return {
			cellData,
			coords,
			nRows,
			nCols,
			lockedCells,
			numCells: nCells,
			debouncedVibrate,
			vibrationEnabled,
			vibrate
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
		cellTheme() {
			return this.$store.state.settings.cellTheme;
		},
		cellThemeType() {
			return this.$store.getters['settings/cellThemeType'];
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
		cellClick(x, y, key) {
			const isLocked = this.lockedCells[key];
			if (isLocked) return;
			const value = this.gridValues[key];
			this.debouncedVibrate();
			this.$emit('toggle-cell', { x, y, value });
		},
	},
};

function useTapVibrate(store, duration) {
	const vibrationEnabled = computed(() => store.state.settings.enableVibration);

	const vibrate = () => {
		if (!vibrationEnabled) return;
		window.navigator.vibrate(duration);
	}

	const debouncedVibrate = debounce(vibrate, duration, {
		leading: true,
		trailing: true,
		maxWait: duration * 2
	});

	return {
		debouncedVibrate,
		vibrate,
		vibrationEnabled
	}
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

<style lang="postcss" scoped>
.puzzle-grid {
	--cell-size-total:  calc(var(--cell-size) - var(--grid-gap));
	grid-area: puzzle-grid;
	grid-template-rows: repeat(var(--rows), var(--cell-size-total));
	grid-template-columns: repeat(var(--columns), var(--cell-size-total));
	@apply mr-auto mb-auto inline-grid relative justify-items-stretch items-stretch;
	gap: var(--grid-gap);
	contain: strict;
}
.puzzle-paused .puzzle-grid, .puzzle-finished .puzzle-grid {
	@apply pointer-events-none;
}

.puzzle-cell-wrapper {
	position: relative;
	contain: strict;
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