<template>
	<div
		class="puzzle-grid"
		:class="{'extra-padding': increasePadding, 'less-padding': decreasePadding }"
	>
		<!-- <template v-for="(row, rowIdx) in grid" :key="rowIdx">
			<div class="cell" v-for="(cell, colIdx) in row" :key="colIdx">
				<div class="inner-celll none" v-if="cell === '.' || cell == null"></div>
				<div class="inner-celll red" v-else-if="cell === '1' || cell === 1"></div>
				<div class="inner-celll blue" v-else></div>
			</div>
		</template> -->

		<template
			v-for="(_row, rowIdx) in rows"
			:key="rowIdx"
		>
			<button
				v-for="(_col, colIdx) in columns"
				:key="colIdx"
				class="cell"
				:data-row="rowIdx"
				:data-col="colIdx"
				@click="cellClick($event, { x: colIdx, y: rowIdx })"
			>
				<div class="cell-wrap">
					<div class="cell-bg"></div>

					<div class="inner-celll red" v-if="grid[rowIdx][colIdx] == '1'"></div>
					<div class="inner-celll blue" v-else-if="grid[rowIdx][colIdx] == '0'"></div>

					<transition name="touch-anim" @after-enter="removeTouchAnim(`${colIdx},${rowIdx}`)">
						<div v-if="touchStates.has(`${colIdx},${rowIdx}`)" class="touch-anim-el"></div>
					</transition>
				</div>
				
			</button>
		</template>
	</div>
</template>

<script>
export default {
	props: {
		increasePadding: Boolean,
		decreasePadding: Boolean,
		board: {
			type: Object,
			required: true,
		},
		rows: Number,
		columns: Number,
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
		}
	},
	methods: {
		cellClick(ev, {x, y}) {
			this.$emit('toggle-cell', {x, y});

			this.touchStates.add(`${x},${y}`);
		},
		removeTouchAnim(value) {
			this.touchStates.delete(value);
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
}
.puzzle-grid.less-padding {
	gap: 1px;
}
.puzzle-grid.extra-padding {
	gap: 4px;
}

.cell {
	@apply text-xs flex justify-center items-center bg-opacity-0 rounded-sm p-px focus:outline-none;
	width: var(--cell-size);
	height: var(--cell-size);
}
.cell.locked {
	@apply cursor-default;
}
.cell-wrap {
	@apply h-full w-full relative;
}
.cell-bg {
	@apply z-0 absolute w-full h-full rounded;
	@apply bg-gray-200 bg-opacity-90 dark:bg-gray-700 dark:bg-opacity-50;
}

.less-padding .cell {
	@apply p-0;
	width: calc(var(--cell-size) - 1px);
	height: calc(var(--cell-size) - 1px);
}
.extra-padding .cell {
	@apply p-0;
	width: calc(var(--cell-size) - 4px);
	height: calc(var(--cell-size) - 4px);
}

.inner-celll {
	@apply m-auto w-full h-full rounded overflow-hidden;
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
	@apply absolute inset-0 pointer-events-none w-full h-full z-30 ring-2 ring-gray-700 opacity-100 rounded;
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