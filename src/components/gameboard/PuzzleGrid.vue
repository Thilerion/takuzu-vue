<template>
	<div
		class="puzzle-grid"
		:class="[`cell-theme-${cellTheme}`, { 'paused': paused }]"
	>
		<template
			v-for="(_row, rowIdx) in rows"
			:key="rowIdx"
		>
			<PuzzleCell
				v-for="(_col, colIdx) in columns"
				class="cell"
				:key="colIdx"
				:data-row="rowIdx"
				:data-col="colIdx"
				@click="cellClick"
				:x="colIdx"
				:y="rowIdx"
				:value="grid[rowIdx][colIdx]"
				:theme="cellTheme"
				:hidden="paused"
			>

					<transition name="touch-anim" @after-enter="removeTouchAnim(`${colIdx},${rowIdx}`)">
						<div v-if="touchStates.has(`${colIdx},${rowIdx}`)" class="touch-anim-el"></div>
					</transition>
				
			</PuzzleCell>
		</template>
	</div>
</template>

<script>
import PuzzleCell from '@/components/gameboard/PuzzleCell.vue';

export default {
	components: {
		PuzzleCell
	},
	props: {
		board: {
			type: Object,
			required: true,
		},
		rows: Number,
		columns: Number,
		paused: Boolean,
	},
	emits: ['toggle-cell'],
	data() {
		return {
			touchStates: new Set()
		}
	},
	computed: {
		grid() {
			return this.board.grid;
		},
		cellTheme() {
			return this.$store.state.settings.cellTheme;
		},
		vibrateOnTap() {
			return this.$store.state.settings.enableVibration;
		}
	},
	methods: {
		cellClick({ x, y, value }) {
			this.vibrate();
			this.$emit('toggle-cell', { x, y, value });
			this.touchStates.add(`${x},${y}`);
		},
		removeTouchAnim(value) {
			this.touchStates.delete(value);
		},
		vibrate() {
			if (!this.vibrateOnTap) return;
			const length = 20;
			window.navigator.vibrate(length);
		}
	},
};
</script>

<style lang="postcss" scoped>
.puzzle-grid {
	grid-area: puzzle-grid;
	grid-template-rows: repeat(var(--rows), 1fr);
	grid-template-columns: repeat(var(--columns), 1fr);
	@apply mr-auto mb-auto inline-grid relative;
	gap: var(--grid-gap);
}
.puzzle-grid.paused {
	@apply pointer-events-none;
}

.cell-bg {
	@apply z-0 absolute w-full h-full;
	@apply bg-gray-200 bg-opacity-90 dark:bg-gray-700 dark:bg-opacity-50;
}

.inner-celll {
	@apply m-auto w-full h-full overflow-hidden;
	width: 100%;
	height: 100%;
}
.inner-celll.red {
	@apply z-10 relative;
	@apply bg-red-500 dark:bg-red-500 dark:bg-opacity-90;
}
.inner-celll.blue {
	@apply z-10 relative;
	@apply bg-blue-500 dark:bg-blue-500 dark:bg-opacity-90;
}

.touch-anim-el {
	@apply absolute inset-0 pointer-events-none w-full h-full z-30 ring-2 ring-gray-700 opacity-100;
}
.touch-anim-enter-active {
	transition: opacity .1s ease;
}
.touch-anim-leave-active {
	transition: opacity 1s ease .4s;
}
.touch-anim-leave-to, .touch-anim-enter-from {
	opacity: 0;
}
</style>