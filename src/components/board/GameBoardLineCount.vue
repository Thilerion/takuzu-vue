<template>
	<div
		class="text-xs line-count"
		:style="lineIdToGridArea(lineId)"
		:class="[lineType, {
			complete: lineComplete
		}]"
	>
		<div class="count zero" :class="{complete: zeroComplete, error: zeroError}">{{countZero}}</div>
		<span class="divider">/</span>
		<div class="count one" :class="{complete: oneComplete, error: oneError}">{{countOne}}</div>
	</div>
</template>

<script>
import { countLineValues } from '@/lib/utils';
import { lineIdToGridArea } from './utils';
import { ONE, ZERO } from '@/lib/constants';

export default {
	props: {
		lineType: {
			type: String,
			required: true
		},
		lineId: {
			type: String,
			required: true
		}
	},
	computed: {
		lineValues() {
			return this.$store.state.game.board.getLine(this.lineId);
		},
		lineCounts() {
			return countLineValues(this.lineValues);
		},
		requiredValues() {
			return this.$store.state.game.board.numRequired[this.lineType];
		},
		countOne() {
			return this.lineCounts[ONE];
		},
		countZero() {
			return this.lineCounts[ZERO];
		},

		zeroComplete() {
			return this.countZero === this.requiredValues[ZERO];
		},
		zeroError() {
			return this.countZero > this.requiredValues[ZERO];
		},
		oneComplete() {
			return this.countOne === this.requiredValues[ONE];
		},
		oneError() {
			return this.countOne > this.requiredValues[ONE];
		},
		lineComplete() {
			return this.zeroComplete && this.oneComplete;
		},
	},
	methods: {
		lineIdToGridArea(lineId) {
			const {row, column} = lineIdToGridArea(lineId);
			return {
				'grid-row': `${row} / span 1`,
				'grid-column': `${column} / span 1`
			}
		}
	}
};
</script>

<style lang="postcss" scoped>
.line-count {
	@apply flex justify-center items-center w-full h-full overflow-hidden relative transition-all font-sans;
}
.line-count.column {
	@apply flex-row;
}
.line-count.row {
	@apply flex-col;
}

.count {
	@apply absolute text-gray-600 transition-all;
}
.count.complete {
	@apply opacity-40;
}
.count.error {
	@apply text-red-600 font-bold;
}

.row .count.zero {
	top: 15%;
	left: 15%;
}
.row .count.one {
	bottom: 15%;
	right: 15%;
}

.column .count.zero {
	top: 10%;
	left: 20%;
}
.column .count.one {
	bottom: 10%;
	right: 20%;
}

.divider {
	@apply opacity-30 transition-opacity;
}
</style>