<template>
	<div
		class="ruler"
		:class="[`ruler-${lineType}`]"
	>
		<template v-if="rulerType === 'coords'">
			<div
				class="ruler-cell ruler-coords"
				v-for="lineId in rulerLines"
				:key="lineId"
			>{{lineId}}</div>
		</template>
		<template v-else>
			<div
				class="ruler-cell ruler-counts"
				v-for="(count, lineIdx) in displayedCountValues"
				:key="lineIdx"
			>{{count[0]}}|{{count[1]}}</div>
		</template>
	</div>
</template>

<script>
import { COLUMN, ROW } from '@/lib/constants';

export default {
	props: {
		rulerType: {
			validator(value) {
				return ['coords', 'count-remaining', 'count-current'].includes(value);
			}
		},
		lineType: {
			type: String,
			required: true
		},
		amount: {
			type: Number,
			required: true
		},
		disabled: {
			type: Boolean
		},
		countValues: {
			type: Array
		}
	},
	computed: {
		rulerLines() {
			if (this.disabled) return [];
			if (this.lineType === 'rows') {
				return Array(this.amount).fill(null).map((_val, idx) => {
					return String.fromCharCode(idx + 65);
				})
			} else if (this.lineType === 'columns') {
				return Array(this.amount).fill(null).map((_val, idx) => idx + 1);
			}
		},
		displayedCountValues() {
			if (this.rulerType === 'coords') return [];
			const key = this.lineType === 'rows' ? ROW : COLUMN;
			const countsKey = this.rulerType === 'count-current' ? 'currentCounts' : 'remainingCounts';
			const counts = this.$store.getters[`puzzle/${countsKey}`][key];
			return counts;
		}
	}
};
</script>

<style lang="postcss" scoped>
.ruler {
	@apply flex leading-none;
	font-size: 10px;
}
.ruler-rows {
	grid-area: ruler-rows;
	width: 16px;
	@apply flex-col justify-around items-center;
}
.ruler-columns {
	grid-area: ruler-cols;
	height: 16px;
	@apply flex-row justify-around items-center;
}

.ruler-cell {
	@apply text-center flex items-center justify-center h-full w-full;
}
.ruler-rows > .ruler-cell {
	@apply mr-auto;
}
.ruler-columns > .ruler-cell {
	@apply mb-auto;
}
</style>