<template>
	<label :for="id" class="toggle-wrapper mb-4" :class="[inline ? inlineClasses : blockClasses, {
		'flex-row-reverse': reverse
	}]">
		<div class="toggle-text"><slot /></div>
		<div class="relative">
			<input class="sr-only" type="checkbox" :id="id" :checked="modelValue" @change="$emit('update:modelValue', $event.target.checked)">
			<div class="toggle-bg"></div>
		</div>
	</label>
</template>

<script setup>
const props = defineProps({
	id: {
		type: String,
		required: true
	},
	modelValue: {
		type: Boolean
	},
	inline: {
		type: Boolean
	},
	reverse: {
		type: Boolean
	}
})
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
.toggle-text {
	@apply flex-1;
}

.toggle-bg {
	@apply bg-gray-200 border-2 border-gray-200 h-6 w-11 rounded-full;
}

.toggle-bg::after {
	content: '';
	@apply absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition shadow-sm
}

input:checked + .toggle-bg::after {
	transform: translateX(100%);
	@apply border-white;
}

input:checked + .toggle-bg {
    @apply bg-blue-600 border-blue-600;
}
</style>