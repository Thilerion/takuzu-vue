<template>
	<BaseButton
		:disabled="disable"
		class="start-btn btn-primary h-16 relative"
	>
		<transition name="fade-inner" mode="out-in">
			<div v-if="gameLoading">
				<div class="absolute inset-y-0 w-1/3 left-0 flex justify-center items-center">
					<LoadingSpinner
						:size="32"
					/>
				</div>
				<span>Creating game...</span>
			</div>
			<div v-else>
				<div>Start a game</div>
				<div class="selection-label">{{sizeStr}} - {{selection.difficulty}}</div>
			</div>
		</transition>
	</BaseButton>
</template>

<script>
export default {
	props: {
		gameLoading: Boolean,
		disable: Boolean,
		selection: {
			type: Object
		}
	},
	computed: {
		sizeStr() {
			if (this.selection == null || this.selection.size == null) return '<choose a size>';
			const {width, height} = this.selection.size;
			return `${width}x${height}`;
		},
	}
};
</script>

<style scoped>
.start-btn {
	/* @apply text-sm py-3 bg-gray-700 text-white dark:bg-truegray-100 dark:text-black w-full mx-auto rounded-lg relative; */
	@apply w-full mx-auto shadow;
}
.start-btn:disabled {
	@apply shadow-none;
}

.fade-inner-enter-active, .fade-inner-leave-active {
	transition: opacity .1s ease;
}
.fade-inner-enter-from, .fade-inner-leave-to {
	opacity: 0;
}

.selection-label {
	@apply text-xs;
}
</style>