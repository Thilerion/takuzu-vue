<template>
<div class="hint w-full inset-x-0 bottom-0 max-h-full h-full flex items-end max-w-screen-sm mx-auto">
	<section
		class="hint-inner
		max-h-full
		h-full
		bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
		w-full text-sm flex flex-col
		pointer-events-auto flex-1 min-h-[6.5rem]
		rounded-t-md
		"
	>
		<header class="flex text-sm items-center pl-4 pr-1.5 h-8 min-h-fit relative pb-1">
			<h1 class="mt-2"><slot name="title">Hint</slot></h1>
			<IconBtn
				scale="0.875"
				class="aspect-square ml-auto absolute top-0 right-0"
				@click="$emit('hide')"
			><icon-ic-baseline-close /></IconBtn>
		</header>
		<div
			class="pl-4 pr-2 my-auto min-h-[4em] w-full flex-1 flex justify-stretch items-start flex-col text-xs leading-[1.5] overflow-x-hidden overflow-y-auto max-h-full h-full"
		>
			<transition name="stepchange" mode="out-in">
				<p :key="step" class="my-auto"><slot name="message">Uh-oh... This hint has no message.</slot></p>
			</transition>
		</div>
		<div v-if="$slots.buttons != null" class="min-h-fit sticky bottom-0 mt-0.5 flex h-9 items-stretch dark:border-slate-500 border-t w-full">
			<div class="min-h-fit flex h-9 items-stretch w-full">
				<slot name="buttons">Default slotted buttons / footer</slot>				
			</div>
		</div>
	</section>
</div>
</template>

<script setup lang="ts">
defineProps<{
	step?: number;
}>();

defineEmits<{
	(e: 'hide'): void;
}>();
</script>

<style scoped>
[data-base-theme="light"] .hint-inner {
	box-shadow: 0 5px 10px 10px rgba(0,0,0,0.03), 0 3px 3px 3px rgba(0,0,0,0.05);
}
[data-base-theme="dark"] .hint-inner {
	box-shadow: 0;
}
</style>

<style>
.stepchange-enter-active,
.stepchange-leave-active {
  transition: opacity 0.1s ease-in-out;
}

.stepchange-enter-from,
.stepchange-leave-to {
  opacity: 0;
}
</style>