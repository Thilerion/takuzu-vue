<template>
	<div class="ruler coords" :class="{'ruler-rows': lineType === 'rows', 'ruler-columns': lineType === 'columns'}">
		<div
			class="ruler-cell"
			v-for="lineId in lineIds"
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
		lineIds: {
			type: Array,
			required: true
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
	@apply flex-col justify-around items-center h-full overflow-y-hidden;
	
}
.ruler-columns {
	grid-area: ruler-cols;
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
</style>