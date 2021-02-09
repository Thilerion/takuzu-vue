<template>
	<div class="check-indicator-wrapper">
		<transition name="checked" @after-enter="disableIndicator">
			<div
				class="check-indicator"
				v-show="errorCheckValue != null"
				:class="{ correct: !errorCheckValue, incorrect: !!errorCheckValue }"
			>
				<div class="check-icon-wrapper">
					<span v-if="!errorCheckValue" class="check-icon material-icons">check</span>
					<span v-else class="check-icon material-icons">close</span>
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
export default {
	data() {
		return {
			
		}
	},
	computed: {
		errorCheckValue() {
			return this.$store.state.game.gameCheck.checkErrorResult;
		}
	},
	methods: {
		disableIndicator() {
			this.$store.commit('gameCheck/setCheckErrorResult', null);
		}
	}
};
</script>

<style lang="postcss" scoped>
.check-indicator {
	@apply absolute inset-0 z-30 opacity-50 flex justify-center items-center pointer-events-none;
}
.check-indicator.correct {
	@apply  text-green-600;
}
.check-indicator.incorrect {
	@apply  text-red-700;
}
.check-icon-wrapper {
	@apply p-6 border-8 rounded-full;
	border-width: 12px;
}
.correct .check-icon-wrapper {
	@apply border-green-600;
}
.incorrect .check-icon-wrapper {
	@apply border-red-700;
}
.check-indicator .check-icon {
	@apply text-8xl font-black leading-none;
}
.checked-enter-active {

}
.checked-leave-active {
	transition: opacity 1.5s ease;
}
.checked-leave-to, .checked-enter-from {
	opacity: 0;
}
</style>