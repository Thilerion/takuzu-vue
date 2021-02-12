<template>
	<div
		class="board relative"
		@pointerdown="boardClicked"
		@pointerup="onPointerUp"
	>
		<GameBoardCell
			v-for="cell in cells"
			:key="cell.idx"
			v-bind="cell"
			:active="isActiveCell(cell)"
			:style="{
				'grid-row': `${cell.y + 2} / span 1`,
				'grid-column': `${cell.x + 2} / span 1`,
			}"
			:data-row="cell.y"
			:data-col="cell.x"
			:data-cell-idx="cell.idx"
			:ref="'cell-' + cell.idx"
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
		},
		activeCells() {
			return this.$store.state.game.markedCells.activeCells;
		},
	},
	methods: {
		isActiveCell({x, y}) {
			return this.activeCells.some(activeCell => {
				return activeCell.x == x && activeCell.y == y;
			})
		},
		getCoords(index) {
			const x = index % this.columns;
			const y = Math.floor(index / this.columns);
			return {x, y};
		},
		toggleCell(payload) {
			console.warn({ type: 'toggling', ...payload})
			this.$store.dispatch('toggleCell', payload);
		},
		boardClicked(e) {
			const {target, path} = e;
			const attribute = target.getAttribute('data-cell-idx');
			if (attribute != null) {
				e.preventDefault();
				this.cellPointerDown(e, attribute);
			} else {
				const lineId = target.getAttribute('data-line-id');
				if (lineId != null) {
					this.lineIdClicked(lineId);
				}
			}
		},
		cellPointerDown(e, cellIdx) {
			const cellRef = this.$refs[`cell-${cellIdx}`];
			this.markActive(cellIdx, e);
			if (e.pointerType === 'mouse') {
			} else {
				cellRef.touchedCell();
			}
			e.preventDefault();
		},
		cellClicked(e) {
			const cellIdx = e.target.getAttribute('data-cell-idx');
			const cellRef = this.$refs[`cell-${cellIdx}`];
			cellRef.clickedCell(false);
		},
		lineIdClicked(lineId) {
			console.log('Line helper was clicked!', lineId);
		},
		onPointerUp(e) {
			const attribute = e.target.getAttribute('data-cell-idx');
			if (attribute == null) return;
			this.unmarkActive(attribute);

			if (e.pointerType === 'mouse') {
				this.cellClicked(e);
			}
			e.preventDefault();
		},
		markActive(idx, e) {
			const x = e.target.getAttribute('data-col') * 1;
			const y = e.target.getAttribute('data-row') * 1;
			this.$store.dispatch('markCellDown', { x, y });
		},
		unmarkActive(idx) {
			this.$store.dispatch('markCellUp');
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