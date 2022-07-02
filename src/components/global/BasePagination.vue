<template>
	<div class="flex flex-row text-sm py-2 gap-4 justify-center items-center px-2">

		<div class="w-10"><button class="bg-white border rounded h-8 px-2" @click="goToPage(-Infinity)" v-if="modelValue > 0"><icon-mdi-chevron-double-left /></button></div>

		<div class="w-10"
		><button
			class="bg-white border rounded h-8 px-2"
			@click="changePage(-1)" v-if="modelValue > 0"
		><icon-mdi-chevron-left /></button></div>

		<div
			class="flex-1 text-center h-8 pt-1 flex items-center justify-center"
		><span v-if="length">{{displayShowingItems}} of {{length}}</span></div>

		<div class="w-10"
		><button
			class="bg-white border rounded h-8 px-2"
			@click="changePage(1)" v-if="modelValue < maxPage"
		><icon-mdi-chevron-right /></button></div>

		<div class="w-10"><button class="bg-white border rounded h-8 px-2" @click="goToPage(Infinity)" v-if="modelValue < maxPage"><icon-mdi-chevron-double-right /></button></div>
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

const showingItems = computed(() => {
	const start = props.pageSize * props.modelValue;
	const end = Math.min(start + props.pageSize - 1, props.length - 1);
	return [start, end];
})
const displayShowingItems = computed(() => {
	if (props.length === 0) return [0, 0];
	return `${showingItems.value[0] + 1}-${showingItems.value[1] + 1}`;
})

const numPages = computed(() => {
	return Math.ceil(props.length / props.pageSize);
})
const maxPage = computed(() => {
	return numPages.value - 1;
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