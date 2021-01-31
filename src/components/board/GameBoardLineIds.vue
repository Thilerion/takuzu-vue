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
				return {style: this.toGridArea('row', idx), lineId: rowId, lineType: 'row'};
			})
			const columns = this.columnIds.map((colId, idx) => {
				return { style: this.toGridArea('column', idx), lineId: colId, lineType: 'column'};
			})
			return [...rows, ...columns];
		}
	},
	methods: {
		toGridArea(type, idx) {
			if (type === 'row') return { 
				'grid-area': `1 / ${idx + 2} / span 1 / span 1`
			};
			else if (type === 'column') return { 
				'grid-area': `${idx + 2} / 1 / span 1 / span 1`
			};
		}
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