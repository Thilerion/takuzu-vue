<template>
	<template
		v-if="hintHighlightType === 'cells'"
	>
	<div
		class="hint-highlight cell-highlight cell"
		v-for="(lineDimensions, idx) in shownHintHighlight"
		:key="idx + 'cell-highlight'"		
		:style="lineDimensions"
	><div class="highlight-inner"></div></div>
	</template>
	<template
		v-if="hintHighlightType === 'line'"
	>
	<div
		class="hint-highlight line-highlight"
		v-for="(lineDimensions, idx) in shownHintHighlight"		
		:key="idx + 'line-highlight'"
		:style="lineDimensions"
	><div class="highlight-inner"></div></div>
	</template>
	
</template>

<script>
import hintTypes from '@/store/hints/hint-types.js';
import { lineTypeFromLineId } from '@/lib/utils.js';
import { COLUMN, ROW } from '@/lib/constants.js';
import { usePuzzleHintsStore } from '@/stores/puzzle-hinter.js';
import { storeToRefs } from 'pinia';
import { usePuzzleStore } from '@/stores/puzzle.js';
import { computed } from 'vue';
function determineHintHighlightType(hint) {
	const { type } = hint;
	if (type === hintTypes.TRIPLES) {
		return 'line';
		return 'cells';
	} else if (type === hintTypes.MISTAKE) {
		return 'cells';
	} else if (type === hintTypes.BALANCE) {
		return 'line';
	} else if (type === hintTypes.ELIMINATION) {
		return 'line';
	} else if (type === hintTypes.ELIM_DUPE) {
		return 'line';
	} else {
		return null;
	}
}


export default {
	setup() {
		const puzzleHintsStore = usePuzzleHintsStore();
		const puzzleStore = usePuzzleStore();
		
		const rowIds = computed(() => puzzleStore?.board?.rowIds);
		const columnIds = computed(() => puzzleStore?.board?.columnIds);

		const { showHint, currentHint } = storeToRefs(puzzleHintsStore);

		return { hintShown: showHint, currentHint, rowIds, columnIds };
	},
	computed: {
		hintSource() {
			if (!this.hintShown) return [];
			const hintSource = this.currentHint?.source ?? [];
			let hintSources = [...hintSource];
			if (this.currentHint?.targetLine != null) {
				hintSources.push(this.currentHint.targetLine);
			}
			return hintSources;
		},
		hintHighlightType() {
			if (!this.hintSource || !this.hintSource.length) return;
			return determineHintHighlightType(this.currentHint);
		},
		shownHintHighlight() {
			if (!this.hintSource || !this.hintSource.length) return;

			const source = this.hintSource;
			const sourceType = source[0].x == null ? 'lineId' : 'coordinates';
			const highlightType = this.hintHighlightType;

			if (highlightType === 'line' && sourceType === 'lineId') {
				return source.map(this.lineIdToGridArea);
			} else if (highlightType === 'line' && sourceType === 'coordinates') {
				return [this.cellListToGridArea(source)];
			} else {
				return this.cellListToGridCells(source);
			}
		}
	},
	methods: {
		cellListToGridCells(cellList = []) {
			return cellList.map(cell => {
				const {x, y} = cell;
				return {
					'grid-row': `${y + 1} / span 1`,
					'grid-column': `${x + 1} / span 1`,
				}
			})
		},
		cellListToGridArea(cellList = []) {
			const xValues = cellList.map(cell => cell.x);
			const yValues = cellList.map(cell => cell.y);

			const rowStart = Math.min(...yValues) + 1;
			const rowEnd = Math.max(...yValues) + 2;

			const colStart = Math.min(...xValues) + 1;
			const colEnd = Math.max(...xValues) + 2;

			const styles = {
				'grid-row': `${rowStart} / ${rowEnd}`,
				'grid-column': `${colStart} / ${colEnd}`,
			}
			return styles;
		},
		lineIdToGridArea(lineId) {
			const line = lineTypeFromLineId(lineId);
			if (line === ROW) {
				const lineIdx = this.rowIds.indexOf(lineId);
				return {
					'grid-column': `1 / span var(--columns)`,
					'grid-row': `${lineIdx + 1} / span 1`
				}
			} else if (line === COLUMN) {
				const lineIdx = this.columnIds.indexOf(lineId);
				return {
					'grid-row': `1 / span var(--rows)`,
					'grid-column': `${lineIdx + 1} / span 1`
				}
			}
		}
	}
};
</script>

<style scoped>
.cell-highlight {
	--hint-size: 2px;
	--hint-outside: calc(var(--hint-size) * -0.5);
	--zoom-distance: 1.5, 1.5, 1.5;
	box-shadow: 0 0 4px -1px rgba(0, 255, 170, 0.8);

	@apply absolute z-10 pointer-events-none animate-pulse;

	left: var(--hint-outside);
	top: var(--hint-outside);
	width: calc(100% + var(--hint-size));
	height: calc(100% + var(--hint-size));
	grid-row: calc(var(--y) + 1) / span 1;
	grid-column: calc(var(--x) + 1) / span 1;
	border-radius: var(--cell-rounding);

	
}

.line-highlight {
	--hint-size: 6px;
	--hint-outside: calc(var(--hint-size) * -0.5);
	--zoom-distance: 1.05, 1.05, 1.05;
	box-shadow: 0 0 4px -1px rgba(0, 255, 170, 1);
	@apply absolute z-10 pointer-events-none animate-pulse;

	left: var(--hint-outside);
	top: var(--hint-outside);
	width: calc(100% + var(--hint-size));
	height: calc(100% + var(--hint-size));
	border-radius: var(--cell-rounding);
}

.highlight-inner {
	@apply w-full h-full ring-2 ring-inset ring-gray-700;
	border-radius: var(--cell-rounding);
	animation: zoomAnim 0.3s ease-in-out .1s forwards;
	opacity: 0;
}
@keyframes zoomAnim {
	0% {
		opacity: 0;
		transform: scale3d(var(--zoom-distance));
	}
	30% {
		opacity: 0.5;
	}
	100% {
		transform: scale3d(1, 1, 1);
		opacity: 1;
	}
}

.line-highlight .highlight-inner {
	@apply ring-gray-900;
}
</style>