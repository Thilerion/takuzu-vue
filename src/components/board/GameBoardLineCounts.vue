<template>
	<GameBoardLineCount
		v-for="line in lineIds"
		:key="line.lineId"
		:line-id="line.lineId"
		:line-type="line.lineType"
	/>
</template>

<script>
import { COLUMN, ROW } from '@/lib/constants';
import GameBoardLineCount from './GameBoardLineCount';

export default {
	components: {
		GameBoardLineCount,
	},
	computed: {
		rowIds() {
			return this.$store.state.game.board.rowIds;
		},
		columnIds() {
			return this.$store.state.game.board.columnIds;
		},
		lineIds() {
			return [
				...this.rowIds.map(lineId => ({lineId, lineType: ROW})),
				...this.columnIds.map(lineId => ({lineId, lineType: COLUMN})),
			]
		}
	},
};
</script>

<style lang="postcss" scoped>
</style>