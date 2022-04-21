<template>
	<section
		class="bg-white rounded shadow-lg px-3 flex items-start flex-col justify-around py-2"
	>
		<header class="text-sm tracking-wide text-gray-500">
			<h3><slot name="title"></slot></h3>
		</header>

		<div
			class="text-2xl font-medium flex items-center justify-center py-2 text-teal-500"
		><span>{{value}}</span></div>

		<div
			class="text-xs text-gray-500"
			v-if="!!$slots.footer"
		><slot name="footer"></slot></div>

		<div
			v-if="false"
			class="py-2 text-xl text-gray-700 font-medium flex flex-row items-center justify-center gap-1"
		>{{value}} <div class="bg-green-100 text-green-800 px-2 rounded-full text-center text-xs font-normal" v-if="hasSubValue">{{subValue}}</div></div>
		<div v-if="false" class="text-xs">{{description}} <small class="text-xs" v-if="hasSubValue">{{subDescription}}</small></div>
	</section>
</template>

<script setup>
import { useSlots } from 'vue';

const props = defineProps({
	value: {
		type: [String, Number],
		required: true
	}
})

const slots = useSlots();


</script>

<style scoped>
</style>