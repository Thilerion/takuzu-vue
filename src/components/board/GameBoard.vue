<template>
	<div
		class="board"
		:style="boardCssVariables"
	>
		<GameBoardCell
			v-for="cell in cells"
			:key="cell.idx"
			:value="cell.value"
			@click="toggleCell(getCoords(cell.idx), cell.value)"
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
		rows: {
			type: Number,
			required: true
		},
		columns: {
			type: Number,
			required: true
		},
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
	},
	methods: {
		getCoords(index) {
			const x = index % this.columns;
			const y = Math.floor(index / this.columns);
			return {x, y};
		},
		toggleCell({ x, y }, value) {
			this.$store.commit('toggleCell', {x, y, value});
		}
	}
};
</script>

<style lang="postcss" scoped>
	
</style>