<template>
	<button class="icon-btn active:hover-none:bg-gray-300 active:hover-none:dark:bg-gray-500/60 hover:hover-hover:bg-gray-200 hover:hover-hover:dark:bg-gray-600/40 active:hover-hover:bg-gray-300 active:hover-hover:dark:bg-gray-500/60 flex items-center justify-center rounded-full outline-none select-none p-2">
		<slot />
	</button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface Props {
	scale?: string | number,
}

const props = withDefaults(defineProps<Props>(), {
	scale: '1.25'
})
</script>

<style scoped>
.icon-btn:deep(svg) {
	font-size: calc(v-bind(scale) * 16px);
}
.icon-btn {
	-webkit-tap-highlight-color: transparent;
	transition-property: background color opacity;
	transition-duration: 0.15s;
	transition-timing-function: ease;
}
</style>