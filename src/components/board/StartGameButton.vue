<template>
	<button
		:disabled="disable"
		class="start-btn"
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
				Start a game
			</div>
		</transition>
	</button>
</template>

<script>
import LoadingSpinner from '../base-layout/LoadingSpinner';

export default {
	components: {
		LoadingSpinner
	},
	props: {
		gameLoading: Boolean,
		disable: Boolean
	}
};
</script>

<style lang="postcss" scoped>
.start-btn {
	@apply uppercase text-sm py-3 bg-gray-700 text-white dark:bg-truegray-100 dark:text-black w-full mx-auto rounded-lg relative;
}

.fade-inner-enter-active, .fade-inner-leave-active {
	transition: opacity .1s ease;
}
.fade-inner-enter-from, .fade-inner-leave-to {
	opacity: 0;
}
</style>