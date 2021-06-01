<template>
	<div
		class="board new-board relative"
		:style="{ '--cell-size': cellSizePx }"
	>
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
			@toggle-cell="toggleCell"
		/>

		<transition name="fade-pause">
			<div class="pause-overlay" v-show="paused">
				<div>
					<span class="material-icons">pause</span>
					<div>Paused</div>
				</div>
			</div>
		</transition>
		<PuzzleCheckIndicator />
	</div>
</template>

<script>
import PuzzleCheckIndicator from './PuzzleCheckIndicator.vue';
import PuzzleGrid from './PuzzleGrid';

export default {
	components: {
		PuzzleGrid,
		PuzzleCheckIndicator,
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
		}
	},
	methods: {
		toggleCell({x, y, value}) {
			// TODO: 1 or 0 first? from settings
			const values = ['0', '1', '.'];
			const idx = values.indexOf(value);
			const nextIdx = (idx + 1) % 3;
			const nextValue = values[nextIdx];
			this.$store.dispatch(
				'puzzle/toggle',
				{ x, y, value: nextValue, prevValue: value }
			);
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

.pause-overlay {
	grid-area: puzzle-grid;
	@apply relative z-10 pointer-events-none bg-gray-100 text-gray-400 grid place-items-center text-4xl;
	border-radius: var(--cell-rounding);
}
.pause-overlay .material-icons {
	@apply text-7xl;
}
.fade-pause-enter-active,
.fade-pause-leave-active {
	transition: opacity .3s ease;
}

.fade-pause-enter-from,
.fade-pause-leave-to {
	opacity: 0;
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