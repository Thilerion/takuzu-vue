<template>
<div class="bg-white rounded-xl py-4 min-h-8 fw-card-content-shadow" :class="paddingXClasses">
	<slot></slot>
</div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { PADDING_X_CLASS_DEFAULT, PaddingXInjectKey } from './constants.js';

const paddingXClasses = inject(PaddingXInjectKey, PADDING_X_CLASS_DEFAULT);
</script>

<style scoped>
.fw-card-content-shadow {
	box-shadow: rgba(0, 0, 0, 0.05) 0px 5px 20px, 0 8px 15px -2px rgb(0 0 0 / 0.04);
}
</style>