<template>
	<div
		class="fixed w-full flex justify-end bottom-0 pb-1 pr-1 pointer-events-none"
	>
		<transition
		enter-active-class="duration-150 ease-out delay-150"
		enter-from-class="transform opacity-0"
		enter-to-class="opacity-100"
		leave-active-class="duration-200 ease-in"
		leave-from-class="opacity-100"
		leave-to-class="transform opacity-0"
		>
			<button
				v-if="y > 100"
				class="p-2 w-[4.5rem] h-[4.5rem] pointer-events-auto"
				@click="scrollToTop"
			><div
				class="flex items-center justify-center text-gray-600 rounded-full bg-white/70 border aspect-square w-full h-full"
			><ArrowUp font-size="1.5rem" /></div></button>
		</transition>
	</div>
</template>

<script setup lang="ts">
import { useScroll } from '@vueuse/core';
import ArrowUp from '~icons/material-symbols/keyboard-arrow-up';

const props = defineProps<{
	el: HTMLElement | null | undefined
}>();

const { x, y } = useScroll(props.el, { behavior: 'smooth' });
const scrollToTop = () => {
	console.log('scroll to top')
	y.value = 0;
}

</script>

<style scoped>

</style>