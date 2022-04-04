<template>
	<div class="flex flex-row text-sm py-2 gap-4 justify-center items-center px-2">

		<div class="w-10"><button class="bg-white border rounded h-8 px-2" @click="goToPage(-Infinity)" v-if="modelValue > 0">First</button></div>

		<div class="w-10"
		><button
			class="bg-white border rounded h-8 px-2"
			@click="changePage(-1)" v-if="modelValue > 0"
		>Left</button></div>

		<div
			class="flex-1 text-center"
		>Page {{modelValue + 1}} of {{displayMaxPage}}</div>

		<div class="w-10"
		><button
			class="bg-white border rounded h-8 px-2"
			@click="changePage(1)" v-if="modelValue < maxPage"
		>Right</button></div>

		<div class="w-10"><button class="bg-white border rounded h-8 px-2" @click="goToPage(Infinity)" v-if="modelValue < maxPage - 1">Last</button></div>
	</div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
	length: {
		type: Number,
		required: true
	},
	pageSize: {
		type: Number,
		default: 10
	},
	modelValue: {
		type: Number,
		required: true
	}
})
const emit = defineEmits(['update:modelValue']);

const maxPage = computed(() => {
	return Math.ceil(props.length / props.pageSize) - 1;
})
const displayMaxPage = computed(() => {
	if (maxPage.value < 1) return 1;
	return maxPage.value;
})

const goToPage = (value) => {
	const newPage = Math.max(0, Math.min(maxPage.value, value));
	emit('update:modelValue', newPage);
}
const changePage = (increment) => {
	const newPage = Math.max(0, Math.min(maxPage.value, props.modelValue + increment));
	emit('update:modelValue', newPage);
}
</script>

<style scoped>

</style>