<template>
	<transition
		:name="transitionName"
		@before-enter="beforeEnter"
		@after-enter="afterEnter"
		mode="out-in"
	>
		<slot />
	</transition>
</template>

<script>
export default {
	props: {
		disable: Boolean,
	},
	data() {
		return {
			hideRootOverflow: false
		}
	},
	computed: {
		transitionName() {
			if (this.disable) return 'none';
			return 'overlay-fade';
		}
	},
	methods: {
		beforeEnter() {
			this.hideRootOverflow = true;
		},
		afterEnter() {
			this.hideRootOverflow = false;
		}
	},
	watch: {
		hideRootOverflow(newValue) {
			const el = document.querySelector('.root');
			el.classList.toggle('overflow-hidden', newValue);
			el.classList.toggle('hide-overflow', newValue);
		}
	}
};
</script>

<style scoped>
.overlay-fade-enter-active {
	transition: all .4s ease;
}
.overlay-fade-leave-active {
	transition: all .2s ease-in-out;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
	opacity: 0;
	transform: scale(1.05) translateY(2rem);
}

/* Disable scale transition for root wrapper page */
.overlay-fade-enter-active.wrapper, .overlay-fade-leave-active.wrapper {
	transition: opacity .1s ease;
}
.overlay-fade-enter-from.wrapper,
.overlay-fade-leave-to.wrapper {
	opacity: 0;
	transform: scale(1);
}
</style>