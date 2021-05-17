<template>
	<div
		class="ruler"
		:class="[`ruler-${lineType}`]"
	>
		<div
			class="ruler-cell"
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