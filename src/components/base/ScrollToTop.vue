<template>
<div class="fixed w-full flex justify-end bottom-0 pb-1 pr-1 pointer-events-none">
	<transition
		enter-active-class="duration-150 ease-out delay-150"
		enter-from-class="transform opacity-0"
		enter-to-class="opacity-100"
		leave-active-class="duration-200 ease-in"
		leave-from-class="opacity-100"
		leave-to-class="transform opacity-0"
	>
		<button
			v-show="showBtn"
			class="p-2 w-[4.5rem] h-[4.5rem] pointer-events-auto transition-opacity"
			@click="scrollToTop"
		><div
			class="flex items-center justify-center text-gray-600 rounded-full bg-white/70 dark:bg-gray-500/50 dark:text-white border dark:border-gray-300/70 aspect-square w-full h-full"
		><icon-material-symbols-keyboard-arrow-up font-size="1.5rem" /></div></button>
	</transition>
</div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { watch } from 'vue';

const props = defineProps<{
	el: HTMLElement | null
}>();

const y = ref(0);
const scrollHandler = (ev: Event) => {
	y.value = (ev.target as HTMLElement).scrollTop;
}
watch(() => props.el, (maybeEl) => {
	if (maybeEl != null) {
		maybeEl.addEventListener('scroll', scrollHandler);
		y.value = maybeEl.scrollTop;
	}
}, { immediate: true });

onBeforeUnmount(() => {
	if (props.el != null) {
		props.el.removeEventListener('scroll', scrollHandler);
	}
})

const scrollToTop = () => {
	console.log('scroll to top')
	props.el!.scrollTo({
		top: 0,
		behavior: 'smooth'
	})
}

const showBtn = computed(() => y.value > 100);

defineExpose({
	y
})

</script>