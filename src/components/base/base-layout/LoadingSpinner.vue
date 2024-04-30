<template>
<div
	class="loading-spinner"
></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
	size: number
}>();

const marginSize = computed(() => Math.floor(props.size / 8));
const afterSize = computed(() => props.size - (2 * marginSize.value));
const borderSize = computed<2 | 3 | 4 | 6>(() => {
	if (marginSize.value >= 8) return 6;
	else if (marginSize.value >= 6) return 4;
	else if (marginSize.value >= 4) return 3;
	return 2;
})
</script>

<style scoped>
/* from: https://loading.io/css/ */
.loading-spinner {
  display: inline-block;
  --size: calc(v-bind(size) * 1px);
  --margin: calc(v-bind(marginSize) * 1px);
  --after-size: calc(v-bind(afterSize) * 1px);
  --border: calc(v-bind(borderSize) * 1px);
  
  width: var(--size);
  height: var(--size);
}
.loading-spinner:after {
  content: " ";
  display: block;
  width: var(--after-size);
  height: var(--after-size);
  margin: var(--margin);
  border-radius: 50%;
  border: var(--border) solid #fff;
  border-color: #fff transparent #fff transparent;
  animation: loading-spinner 1.2s linear infinite;
}
@keyframes loading-spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>