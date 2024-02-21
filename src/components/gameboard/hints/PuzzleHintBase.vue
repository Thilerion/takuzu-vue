<template>
<div class="hint w-full inset-x-0 bottom-0 h-full flex items-end">
	<section
		class="hint-inner
		max-h-32
		bg-white dark:bg-slate-700 text-slate-900 dark:text-white
		w-full text-sm flex flex-col
		pointer-events-auto flex-1 min-h-[6.5rem]
		"
	>
		<header class="flex text-sm bg-slate-100/0 items-center pl-4 pr-1.5 h-7 min-h-fit">
			<h1><slot name="title">Default slotted title</slot></h1>
			<IconBtn
				scale="1"
				class="h-full !p-0 aspect-square ml-auto"
				@click="$emit('hide')"
			><icon-ic-baseline-close />
			</IconBtn>
		</header>
		<div
			class="pl-4 pr-2 my-auto min-h-[4em] w-full flex-1 flex justify-stretch items-start flex-col text-xs leading-[1.5] overflow-x-hidden overflow-y-auto max-h-full h-full"
		>
		<transition name="stepchange" mode="out-in">
			<p :key="step" class="my-auto"><slot name="message">Default slotted message</slot></p>
		</transition>
		</div>
		<div class="min-h-fit sticky bottom-0 mt-0.5 flex h-9 items-stretch border-t w-full">
			<transition name="stepchange" mode="out-in">
				<div :key="step">
					<slot name="buttons">Default slotted buttons / footer</slot>				
				</div>
			</transition>
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
.hint-inner {
	box-shadow: 0 5px 10px 10px rgba(0,0,0,0.03), 0 3px 3px 3px rgba(0,0,0,0.05);
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