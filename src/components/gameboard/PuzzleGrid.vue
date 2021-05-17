<template>
	<div
		class="puzzle-grid"
		:class="{'extra-padding': increasePadding, 'less-padding': decreasePadding }"
	>
		<template v-for="(row, rowIdx) in grid" :key="rowIdx">
			<div class="cell" v-for="(cell, colIdx) in row" :key="colIdx">
				<div class="inner-celll none" v-if="cell === '.' || cell == null"></div>
				<div class="inner-celll red" v-else-if="cell === '1' || cell === 1"></div>
				<div class="inner-celll blue" v-else></div>
			</div>
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
	},
	computed: {
		grid() {
			return this.board.grid;
		}
	}
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
	@apply bg-blue-300 text-xs overflow-hidden flex justify-center items-center bg-opacity-0 rounded-sm p-px;
	width: var(--cell-size);
	height: var(--cell-size);
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
	@apply m-auto overflow-hidden rounded-sm w-full h-full;
	width: 100%;
	height: 100%;
}

.inner-celll.red {
	@apply bg-red-500 dark:bg-red-500 dark:bg-opacity-90;
}
.inner-celll.blue {
	@apply bg-blue-500 dark:bg-blue-500 dark:bg-opacity-90;
}
.inner-celll.none {
	@apply bg-gray-200 bg-opacity-90 dark:bg-gray-700 dark:bg-opacity-50;
}
</style>