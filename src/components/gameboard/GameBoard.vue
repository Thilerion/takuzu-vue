<template>
	<div
		class="board new-board relative"
	>
		<div class="ruler-wrapper-columns" :class="{paused}"><slot name="ruler-columns" /></div>
		<div class="ruler-wrapper-rows" :class="{paused}"><slot name="ruler-rows" /></div>
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
				'width': gridWidth,
				'height': gridHeight,
			}"
			@toggle-cell="toggleCell"
		/>

		<transition name="fade-pause">
			<div class="pause-overlay text-center" v-show="paused">
				<div class="flex flex-col h-full px-2 pt-8 pb-6">
					<button
						class="h-5/6 flex-auto mx-auto flex justify-center pause-icon-wrapper place-items-center py-2 pointer-events-auto"
						@click="resumeByUser"
					><icon-grommet-icons-pause-fill class="opacity-80" /></button>
					<div class="flex-auto pause-label-wrapper uppercase mb-2 py-2">Paused</div>
					<!-- <div class="flex-auto restart-label">Click to continue</div> -->
				</div>
			</div>
		</transition>
		<PuzzleCheckIndicator />
	</div>
</template>

<script>
import { usePuzzleStore } from '@/stores/puzzle.js';
import PuzzleCheckIndicator from './PuzzleCheckIndicator.vue';
import PuzzleGrid from './PuzzleGrid.vue';
import BaseButton from '../global/BaseButton.vue';

export default {
	components: {
    PuzzleGrid,
    PuzzleCheckIndicator,
    BaseButton
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
	setup() {
		const puzzleStore = usePuzzleStore();
		const toggleCell = ({ x, y, value }) => puzzleStore.toggle({ x, y, prevValue: value });
		const resumeByUser = () => {
			if (puzzleStore.pausedByUser) {
				puzzleStore.setPaused(false, { userAction: true });
			}
		}
		return { toggleCell, resumeByUser };
	},
	computed: {
		// computed properties for styling
		cellSizePx() {
			return (this.cellSize ?? 16) + 'px';
		}
	},
};
</script>

<style scoped>
.board {
	@apply inline-grid relative;
	grid-template-areas: "none info"
		"none ruler-cols"
		"ruler-rows puzzle-grid";
	--cell-size-num: v-bind(cellSize);
	--cell-size: calc(var(--cell-size-num) * 1px);
}

.pause-overlay {
	/* TODO: Pointer-events-none must be pointer-events-auto to prevent cell clicking */
	grid-area: puzzle-grid;
	@apply relative z-10 pointer-events-none bg-gray-100 text-gray-400 grid place-items-center text-4xl;
	border-radius: var(--cell-rounding);
	@apply dark:bg-slate-800 dark:text-slate-200;
}
.fade-pause-enter-active,
.fade-pause-leave-active {
	transition: opacity .3s ease;
}

.fade-pause-enter-from,
.fade-pause-leave-to {
	opacity: 0;
}

.pause-icon-wrapper {
	font-size: clamp(20px, 25vmin, 90px);
}
.pause-label-wrapper {
	@apply opacity-80 font-light;
	letter-spacing: 0.15em;
	font-size: clamp(20px, 10vmin, 60px);
}
.restart-label {
	@apply text-base;
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