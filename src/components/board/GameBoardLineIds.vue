<template>
	<div
		v-for="line in lineIds"
		:key="line.lineId"
		class="text-xs line-id"
		:style="line.style"
		:class="[line.lineType]"
	>
		{{ line.lineId }}
	</div>
</template>

<script>
import { lineIdToGridArea } from './utils';

export default {
	computed: {
		rowIds() {
			return this.$store.state.game.board.rowIds;
		},
		columnIds() {
			return this.$store.state.game.board.columnIds;
		},
		lineIds() {
			const rows = this.rowIds.map((rowId, idx) => {
				return {
					style: this.toGridArea(rowId),
					lineId: rowId,
					lineType: 'row'
				};
			})
			const columns = this.columnIds.map((colId, idx) => {
				return { 
					style: this.toGridArea(colId),
					lineId: colId,
					lineType: 'column'
				};
			})
			return [...rows, ...columns];
		}
	},
	methods: {
		toGridArea(lineId) {
			const {row, column} = lineIdToGridArea(lineId);
			return {
				'grid-row': `${row} / span 1`,
				'grid-column': `${column} / span 1`
			}
		},
	}
};
</script>

<style lang="postcss" scoped>
.line-id {
	@apply flex justify-center items-center text-gray-600 font-sans;
	font-size: 10px;
}
.line-id.row {

}
</style>