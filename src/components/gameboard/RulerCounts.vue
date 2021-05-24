<template>
	<div class="ruler counts" :class="{'ruler-rows': lineType === 'rows', 'ruler-columns': lineType === 'columns'}">
		<div class="ruler-cell" v-for="(lineCount, lineIdx) in displayedCountValues" :key="lineIdx">
			<div class="ruler-cell-inner">
				<div class="zero-wrapper"><div>{{lineCount[0]}}</div></div>
				<div class="one-wrapper"><div>{{lineCount[1]}}</div></div>
			</div>
		</div>
	</div>
</template>

<script>
import { COLUMN, ROW } from '@/lib/constants';
export default {
	props: {
		lineType: {
			type: String,
			required: true
		}
	},
	computed: {
		displayedCountValues() {
			const key = this.lineType === 'rows' ? ROW : COLUMN;
			const countsKey = 'currentCounts';
			const counts = this.$store.getters[`puzzle/${countsKey}`][key];
			return counts;
		}
	}
};
</script>

<style lang="postcss" scoped>
.ruler {
	@apply grid leading-none place-items-center;
	gap: var(--grid-gap);
	--ruler-cell-size: calc(var(--cell-size) - var(--grid-gap));
	--half-size: calc(var(--cell-size) / 4);
	--font-size: clamp(10px, var(--half-size), 2rem);
	font-size: var(--font-size);
}
.ruler-rows {
	width: var(--ruler-cell-size);
	@apply h-full flex-col;
	grid-template-rows: repeat(var(--rows), 1fr);
	grid-template-columns: 1fr;
}
.ruler-columns {
	height: var(--ruler-cell-size);
	@apply w-full flex-row;
	grid-template-columns: repeat(var(--columns), 1fr);
	grid-template-rows: 1fr;
}

.ruler-cell {
	@apply flex;
	height: var(--ruler-cell-size);
	width: var(--ruler-cell-size);
	padding: 12%;
}
.ruler-cell-inner {
	@apply relative w-full h-full bg-blue-100 m-auto overflow-hidden font-sans;
}
.ruler-cell .zero-wrapper {
	@apply text-center absolute w-2/3 h-2/3 left-0 top-0 flex pr-px pb-px;
}
.ruler-cell .one-wrapper {
	@apply text-center absolute w-2/3 h-2/3 right-0 bottom-0 flex pl-px pt-px;
}
.one-wrapper > div, .zero-wrapper > div {
	@apply m-auto;
}
</style>