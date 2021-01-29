<template>
	<div
		class="cell-wrapper"
		:class="{'locked': isLocked}"
		@click="clickedCell"
	>
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
		value: {
			required: true
		},
		x: {
			type: Number,
			required: true
		},
		y: {
			type: Number,
			required: true
		}
	},
	computed: {
		cellId() {
			return `${this.x},${this.y}`;
		},
		isLocked() {
			return this.$store.getters.lockedCells.includes(this.cellId);
		}
	},
	methods: {
		clickedCell() {
			if (this.isLocked) return;
			const payload = { value: this.value, x: this.x, y: this.y};
			this.$emit('clicked', payload);
		}
	}
};
</script>

<style lang="postcss" scoped>
.cell-wrapper {
	--size: clamp(1.25rem, calc(var(--cell-size)), 4rem);
	width: var(--size);
	height: var(--size);
	@apply bg-truegray-200 dark:bg-gray-800 rounded-sm relative;
}
.cell-wrapper.locked {
	@apply bg-truegray-300 dark:bg-gray-700;
}

.cell {
	@apply flex relative w-full h-full;
}

.cell-value {
	@apply m-auto inline-block text-gray-700;
	font-size: var(--cell-font-size);
	line-height: calc(var(--size) * 1.1);
}
</style>