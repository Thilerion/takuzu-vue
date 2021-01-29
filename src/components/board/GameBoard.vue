<template>
	<div
		class="board"
	>
		<GameBoardCell
			v-for="cell in cells"
			:key="cell.idx"
			v-bind="cell"
			:style="{
				'grid-row': `${cell.y + 2} / span 1`,
				'grid-column': `${cell.x + 2} / span 1`,
			}"
			@clicked="toggleCell"
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
	computed: {
		finishedAndCorrect() {
			return this.$store.getters.finishedAndCorrect;
		}
	},
	methods: {
		getCoords(index) {
			const x = index % this.columns;
			const y = Math.floor(index / this.columns);
			return {x, y};
		},
		toggleCell({ x, y, value }) {
			this.$store.dispatch('toggleCell', {x, y, value});
		}
	},
	watch: {
		finishedAndCorrect(newValue, oldValue) {
			if (newValue && !oldValue) {
				setTimeout(() => {
					window.alert('GOOD JOB!');
					this.$store.commit('reset');
				}, 500);
			}
		}
	}
};
</script>

<style lang="postcss" scoped>
	
</style>