<template>
	<div class="board new-board relative">
		<Ruler
			line-type="columns"
			:amount="columns"
			:disabled="!rulerSize || rulerSize === '0px'"
		/>
		<Ruler
			line-type="rows"
			:amount="rows"
			:disabled="!rulerSize || rulerSize === '0px'"			
		/>
		<div class="puzzle-info-wrapper">
			<slot name="puzzle-info" />
		</div>

		<PuzzleGrid
			:board="board"
			:initial-board="initialBoard"
			:rows="rows"
			:columns="columns"
			:style="{
				'max-width': gridWidth,
				'max-height': gridHeight,
				'--cell-size': cellSizePx,
			}"
			:class="[`size-${gridGapSizing}`]"
			@toggle-cell="toggleCell"
		/>
	</div>
</template>

<script>
import Ruler from './Ruler';
import PuzzleGrid from './PuzzleGrid';

export default {
	components: {
		Ruler,
		PuzzleGrid,
	},
	props: {
		rows: Number,
		columns: Number,
		rulerSize: String,
		gridHeight: String,
		gridWidth: String,
		cellSize: {
			type: Number,
			required: true
		},
		board: {
			type: Object,
			required: true
		},
		initialBoard: {
			type: Object,
			required: true
		}
	},
	data() {
		return {}
	},
	computed: {
		// computed properties for styling
		cellSizePx() {
			return (this.cellSize ?? 16) + 'px';
		},
		gridGapSizing() {
			if (this.cellSize <= 28) {
				return 'xs';
			} else if (this.cellSize <= 36) {
				return 's';
			} else if (this.cellSize <= 48) {
				return 'm';
			} else if (this.cellSize <= 64) {
				return 'l';
			} else {
				return 'xl';
			}
		},
	},
	methods: {
		toggleCell({x, y, value}) {
			const values = ['0', '1', '.'];
			const idx = values.indexOf(value);
			const nextIdx = (idx + 1) % 3;
			const nextValue = values[nextIdx];
			this.$store.commit('puzzle/setValue', { x, y, value: nextValue });
		}
	},
};
</script>

<style lang="postcss" scoped>
.board {
	@apply inline-grid relative;
	grid-template-areas: "none info"
		"none ruler-cols"
		"ruler-rows puzzle-grid";
}

.puzzle-info-wrapper {
	grid-area: info;
	/* Flexbox with child min-width to keep center on overflow */
	@apply relative flex flex-row justify-center w-full items-start;
}
</style>