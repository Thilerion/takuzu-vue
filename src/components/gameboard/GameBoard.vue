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
			<slot />
		</div>

		<PuzzleGrid
			:increasePadding="increaseCellPadding"
			:decreasePadding="decreaseCellPadding"
			:board="board"
			:initial-board="initialBoard"
			:rows="rows"
			:columns="columns"
			:style="{
				'max-width': gridWidth,
				'max-height': gridHeight,
				'--cell-size': cellSizePx
			}"
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
		decreaseCellPadding() {
			return this.cellSize < 28;
		},
		increaseCellPadding() {
			return this.cellSize > 48;
		},
	},
	methods: {
		toggleCell({x, y}) {
			console.log(x, y);
		}
	}
	
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