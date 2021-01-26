<template>
	<div
		class="board"
		:style="boardCssVariables"
	>
		<GameBoardCell
			v-for="cell in cells"
			:key="cell.idx"
			:value="cell.value"
		/>
	</div>
</template>

<script>
import GameBoardCell from './GameBoardCell';

export default {
	components: {
		GameBoardCell,
	},
	props: {
		rows: Number,
		columns: Number,
		cellSize: Number,
		gap: Number,
		cellFontSize: Number,
		cells: {
			type: Array,
			required: true
		}
	},
	computed: {
		boardCssVariables() {
			return {
				'--rows': this.rows,
				'--columns': this.columns,
				'--cell-size': this.cellSize,
				'--gap': this.gap,
				'--cell-font-size': this.cellFontSize
			}
		}
	}
};
</script>

<style lang="postcss" scoped>
	
</style>