<template>
	<div class="board new-board relative" :style="{ '--cell-size': cellSizePx }">
		<div class="ruler-wrapper-columns"><slot name="ruler-columns" /></div>
		<div class="ruler-wrapper-rows"><slot name="ruler-rows" /></div>
		<div class="puzzle-info-wrapper">
			<slot name="puzzle-info" />
		</div>

		<PuzzleGrid
			:board="board"
			:rows="rows"
			:columns="columns"
			:paused="paused"
			:style="{
				'max-width': gridWidth,
				'max-height': gridHeight,
			}"
			:class="[`size-${gridGapSizing}`]"
			@toggle-cell="toggleCell"
		/>
	</div>
</template>

<script>
import PuzzleGrid from './PuzzleGrid';

export default {
	components: {
		PuzzleGrid,
	},
	props: {
		rows: Number,
		columns: Number,
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
		paused: Boolean,
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
			this.$store.dispatch('puzzle/toggle', { x, y, value: nextValue, prevValue: value });
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

.ruler-wrapper-columns {
	grid-area: ruler-cols;
	@apply h-full overflow-y-hidden;
	/* @apply bg-red-100; */
}
.ruler-wrapper-rows {
	grid-area: ruler-rows;
	@apply w-full overflow-x-hidden;
	/* @apply bg-blue-100; */
}
</style>