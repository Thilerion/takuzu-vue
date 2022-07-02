<template>
	<transition
		:name="transitionName"
		@before-enter="hideOverflow"
		@after-enter="showOverflow"
		@before-leave="hideOverflow"
		@after-leave="showOverflow"
		mode="out-in"
	>
		<template v-if="show">
			<slot />		
		</template>
	</transition>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';

const props = defineProps<{
	disable?: boolean,
	show: boolean
}>();

const hideRootOverflow = ref(false);
const transitionName = computed(() => props.disable ? 'none' : 'overlay-fade');

const hideOverflow = () => hideRootOverflow.value = true;
const showOverflow = () => hideRootOverflow.value = false;

watchEffect(() => {
	const val = hideRootOverflow.value;
	const el = document.querySelector('.root');
	if (el == null) return;
	el.classList.toggle('overflow-hidden', val);
	el.classList.toggle('hide-overflow', val);
})
</script>

<style scoped>
.overlay-fade-enter-active {
	transition: all .3s ease;
}
.overlay-fade-leave-active {
	transition: all .15s ease-in-out;
}

.overlay-fade-enter-active:not(.wrapper), .overlay-fade-leave-active:not(.wrapper) {
	overflow: clip;
	@apply h-vh w-screen;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
	opacity: 0;
	transform: scale(1.035) translateY(1.5rem);
}

/* Disable scale transition for root wrapper page */
.overlay-fade-enter-active.wrapper, .overlay-fade-leave-active.wrapper {
	transition: opacity .05s ease;
}
.overlay-fade-enter-from.wrapper,
.overlay-fade-leave-to.wrapper {
	opacity: 0;
	transform: scale(1);
}
</style>