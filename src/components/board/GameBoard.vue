<template>
	<div
		class="board"
	>
		<GameBoardCell
			v-for="cell in cells"
			:key="cell.idx"
			:value="cell.value"
			:style="{
				'grid-row': `${cell.y + 2} / span 1`,
				'grid-column': `${cell.x + 2} / span 1`,
			}"
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
		cells: {
			type: Array,
			required: true
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