<template>
	<div class="cell-wrapper">
		<div class="cell">
			<span class="cell-value">{{value}}</span>
		</div>
	</div>
</template>

<script>
export default {
	components: {
	},
	props: {
		value: String,
	}
};
</script>

<style lang="postcss" scoped>
.cell-wrapper {
	--size: clamp(1.25rem, calc(var(--cell-size) * 1px), 4rem);
	width: var(--size);
	height: var(--size);
	@apply bg-truegray-200 dark:bg-gray-800 rounded-sm relative;
}

.cell {
	@apply flex relative w-full h-full;
}

.cell-value {
	@apply m-auto inline-block text-gray-700;
	font-size: calc(var(--cell-font-size) * 1px);
	line-height: calc(var(--size) * 1.1);
}
</style>