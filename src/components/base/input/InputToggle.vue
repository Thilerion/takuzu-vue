<template>
<label
	:for="id"
	class="toggle-wrapper mb-4"
	:class="[inline ? inlineClasses : blockClasses, {
		'flex-row-reverse': reverse,
		small
	}]"
>
	<div class="toggle-text"><slot /></div>
	<div class="relative">
		<input
			:id="id"
			class="sr-only"
			type="checkbox"
			:checked="modelValue"
			@change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
		>
		<div class="toggle-bg"></div>
	</div>
</label>
</template>

<script setup lang="ts">
import { toRef } from 'vue';

const props = withDefaults(defineProps<{
	id: string,
	modelValue: boolean,
	inline?: boolean,
	reverse?: boolean,
	small?: boolean
}>(), {
	inline: false,
	reverse: false,
	small: false
})
const reverse = toRef(props, 'reverse');


const inlineClasses = [
	'inline-flex', 'w-auto'
];
const blockClasses = [
	'flex', 'w-full'
];
const emit = defineEmits(['update:modelValue']);
</script>

<style scoped>
.toggle-wrapper {
	@apply items-center cursor-pointer relative h-10 gap-3;
}
.toggle-wrapper.small {
	@apply h-8;
}
.toggle-text {
	@apply flex-1;
}

.toggle-bg {
	@apply bg-gray-200 dark:bg-gray-200/50 dark:border-2 dark:border-gray-200/20 border-2 border-gray-200 h-6 w-11 rounded-full;
}
.small .toggle-bg {
	@apply h-5 w-9 after:h-4 after:w-4;
}

.toggle-bg::after {
	content: '';
	@apply absolute top-0.5 left-0.5 bg-white dark:bg-white/80 border border-gray-300 dark:border-gray-200/10 rounded-full h-5 w-5 transition shadow-sm
}

input:checked + .toggle-bg::after {
	transform: translateX(100%);
	@apply border-white;
}

input:checked + .toggle-bg {
    @apply bg-teal-600 border-teal-600;
}
</style>