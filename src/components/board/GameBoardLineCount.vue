<template>
	<div
		class="line-count"
		:style="lineIdToGridArea(lineId)"
		:class="[lineType, {
			complete: lineComplete
		}]"
	>
		<div class="count-wrapper zero">
			<div class="count zero" :class="{complete: zeroComplete, error: zeroError}">{{countZero}}</div>
		</div>
		<div class="count-wrapper one">
			<div class="count one" :class="{complete: oneComplete, error: oneError}">{{countOne}}</div>
		</div>
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
	display: grid;
	grid-template-rows: repeat(3, 1fr);
	grid-template-columns: repeat(3, 1fr);

	padding: 12%;

	@apply overflow-hidden relative transition-colors font-sans justify-items-stretch items-stretch;
	/* @apply bg-teal-100; */
	width: var(--cell-size);
	height: var(--cell-size);

	--half-size: calc(var(--cell-size) / 3);
	--font-size: clamp(10px, var(--half-size), 2rem);
	font-size: var(--font-size);
	line-height: 1;
}

.count {
	@apply text-gray-600 w-full h-full overflow-hidden;
	transition-property: opacity background-color color;
	transition-duration: 0.2s;
	transition-timing-function: ease;
}
.count.complete {
	@apply opacity-40;
}
.count.error {
	@apply text-red-600 font-bold;
}

.count-wrapper {
	display: flex;
}
.count-wrapper.zero {
	grid-row: 1 / span 2;
	grid-column: 1 / span 2;
}
.count-wrapper.one {
	grid-row: 2 / span 2;
	grid-column: 2 / span 2;
}

.one {
	@apply mt-auto ml-auto;
}
.zero {
	@apply mb-auto mr-auto;
}

.divider {
	@apply opacity-30 transition-opacity;
}
</style>