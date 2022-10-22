<template>
	<div class="time-box w-full text-white text-2xl text-center">
		<span class="drop-shadow-sm"><slot>{{ formattedTime }}</slot></span>
	</div>
</template>

<script setup lang="ts">
import { formatTimeMMSSWithRounding } from '@/utils/time.utils';
import { computed } from 'vue';

const props = defineProps<{
	timeElapsed: number
}>();
const formatTimeMMSS = formatTimeMMSSWithRounding(200);
const formattedTime = computed(() => formatTimeMMSS(props.timeElapsed));
</script>

<style scoped>
.time-box {
	box-shadow: inset 0px -20px 50px -39px rgba(255, 255, 255, 0.2);
}
</style>