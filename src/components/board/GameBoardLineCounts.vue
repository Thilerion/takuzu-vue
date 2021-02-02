<template>
	<GameBoardLineCount
		v-for="line in lineIds"
		:key="line.lineId"
		:line-id="line.lineId"
		:line-type="line.lineType"
		:line-counts="delayedCounts[line.lineId]"
		:count-type="countType"
	/>
</template>

<script>
import { COLUMN, ROW } from '@/lib/constants';
import GameBoardLineCount from './GameBoardLineCount';
import { countLineValues } from '@/lib/utils';
import debounce from 'lodash.debounce';

export default {
	components: {
		GameBoardLineCount,
	},
	props: {
		countType: {
			type: String,
			required: true
		}
	},
	data() {
		return {
			delayedCounts: null,
		}
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
		},
		lineCounts() {
			const board = this.$store.state.game.board;
			if (board == null) return {};
			return board.lineIds.reduce((acc, lineId) => {
				const values = board.getLine(lineId);
				const counts = countLineValues(values);
				acc[lineId] = counts;
				return acc;
			}, {});
		}
	},
	methods: {
		updateLineCounts() {
			this.delayedCounts = this.lineCounts;
		}
	},
	watch: {
		lineCounts: {
			// delaying counts, to prevent the counts from going red while double-clicking to toggle
			handler() {
				this.debouncedUpdateLineCounts();
			},
			deep: true,
		}
	},
	created() {
		this.debouncedUpdateLineCounts = debounce(this.updateLineCounts, 350, {
			maxWait: 800,
			trailing: true,
			leading: false
		});
	},
	beforeMount() {
		this.delayedCounts = this.lineCounts;
	}
};
</script>

<style lang="postcss" scoped>
</style>