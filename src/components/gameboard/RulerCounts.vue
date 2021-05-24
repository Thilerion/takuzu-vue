<template>
	<div class="ruler counts" :class="{'ruler-rows': lineType === 'rows', 'ruler-columns': lineType === 'columns'}">
		<div class="ruler-cell" v-for="(lineCount, lineIdx) in displayedCountValues" :key="lineIdx">

			<div class="count-wrapper zero">
				<div class="count zero">
					{{lineCount[0]}}
				</div>
			</div>
			<div class="count-wrapper one">
				<div class="count one">
					{{lineCount[1]}}
				</div>
			</div>
			<div class="divider-wrapper">
				<div class="divider"></div>
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
	grid-template-rows: repeat(3, 1fr);
	grid-template-columns: repeat(3, 1fr);

	padding: 15%;
	@apply grid leading-none overflow-hidden relative transition-colors font-sans justify-items-stretch items-stretch pointer-events-auto;
	width: var(--ruler-cell-size);
	height: var(--ruler-cell-size);

	--half-size: calc(var(--ruler-cell-size) * 0.3);
	--font-size: clamp(10px, var(--half-size), 2rem);
	font-size: var(--font-size);
}
.count {
	@apply w-full h-full overflow-hidden opacity-80;
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

.divider-wrapper {
	@apply absolute w-full h-full opacity-50;
	display: flex;
	align-items: center;
	justify-content: center;
}
.divider {
	transform-origin: 50% 50%;
	transform: rotate(50deg);
	@apply opacity-30 transition-opacity bg-black;
	width: 1px;
	height: 50%;
}
</style>