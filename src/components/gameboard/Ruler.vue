<template>
	<div
		class="ruler"
		:class="[`ruler-${lineType}`]"
	>
		<div
			v-for="lineId in rulerLines"
			:key="lineId"
		>{{lineId}}</div>
	</div>
</template>

<script>
export default {
	props: {
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
	grid-column: 1 / span 1;
	grid-row: 2 / span calc(var(--rows) + 1);

	margin-top: calc(var(--ruler-size) + var(--cell-padding));
	margin-bottom: var(--cell-padding);
	@apply flex-col justify-around items-center;
}
.ruler-columns {
	grid-row: 2 / span 1;
	grid-column: 1 / span calc(var(--columns) + 1);

	margin-left: calc(var(--ruler-size) + var(--cell-padding));
	margin-right: var(--cell-padding);
	@apply flex-row justify-around items-center;
}

.ruler > div {
	@apply text-center flex items-center justify-center h-full w-full;
}
.ruler-rows > div {
	@apply mr-auto;
	/* width: 12px; */
	/* height: 12px; */
}
.ruler-columns > div {
	@apply mb-auto;
	/* width: calc(100% - var(--cell-padding) * 2); */
	/* height: 12px; */
}
</style>