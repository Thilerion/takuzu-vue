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
		<GameBoardLineCounts
			v-if="showLineCounts"
			:count-type="lineCountType"
		/>
		<GameBoardLineIds v-else-if="showBoardCoordinates" />
		<GameBoardRuleViolation v-for="(conflict, idx) in ruleViolations" :value="conflict" :key="idx" />
	</div>
</template>

<script>
import GameBoardCell from './GameBoardCell';
import GameBoardLineCounts from './GameBoardLineCounts';
import GameBoardLineIds from './GameBoardLineIds';
import GameBoardRuleViolation from './GameBoardRuleViolation';

export default {
	components: {
		GameBoardCell,
		GameBoardLineCounts,
		GameBoardLineIds,
		GameBoardRuleViolation,
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
		},
		showBoardCoordinates() {
			return this.$store.getters['settings/showBoardCoordinates'];
		},
		showLineCounts() {
			return this.$store.getters['settings/showBoardLineCounts'];
		},
		lineCountType() {
			return this.$store.state.settings.showLineInfo;
		},
		ruleViolations() {
			return this.$store.getters['gameCheck/markedRuleViolations'];
		}
	},
	methods: {
		getCoords(index) {
			const x = index % this.columns;
			const y = Math.floor(index / this.columns);
			return {x, y};
		},
		toggleCell(payload) {
			this.$store.dispatch('toggleCell', payload);
		}
	},
	watch: {
		finishedAndCorrect(newValue, oldValue) {
			if (newValue && !oldValue) {
				setTimeout(() => {
					window.alert('GOOD JOB!');
					this.$store.dispatch('finishGame');
				}, 500);
			}
		}
	}
};
</script>

<style lang="postcss" scoped>
	
</style>