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
			>
				<div class="ruler-line-count zero">{{count[0]}}</div>
				<span class="count-divider" v-if="lineType === 'columns'">|</span>
				<span class="count-divider" v-else-if="lineType === 'rows'">--</span>
				<div class="ruler-line-count one">{{count[1]}}</div>
			</div>
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
	width: 16px;
	@apply flex-col justify-around items-center h-full overflow-y-hidden;
	
}
.ruler-columns {
	height: 16px;
	@apply flex-row justify-around items-center w-full overflow-x-hidden;
}

.ruler-cell {
	@apply text-center flex items-center justify-center h-full w-full;
}
.ruler-rows > .ruler-cell {
	@apply mr-auto;
	max-height: var(--cell-size);
}
.ruler-columns > .ruler-cell {
	@apply mb-auto;
	max-width: var(--cell-size);
}

.ruler-counts {
	@apply flex even:bg-blue-100 even:bg-opacity-50;
}
.ruler-rows .ruler-counts {
	@apply flex-col text-right leading-none;
}
.ruler-columns .ruler-counts {
	@apply flex justify-around;
	max-width: 6ch;
}
.ruler-rows .count-divider {
	height: 1px;
	width: 50%;
	@apply bg-gray-500 mb-px;
}
.ruler-columns .ruler-line-count {
	@apply flex-1;
}
.ruler-columns .count-divider {
	@apply mx-px;
}
</style>