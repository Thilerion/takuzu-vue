<template>
<div class="w-full">
	<div
		v-if="$slots.heading"
		:class="paddingXClasses"
		class="mb-1"
	>
		<slot name="heading"></slot>
	</div>
	<slot></slot>
</div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { PADDING_X_CLASS_DEFAULT, PaddingXInjectKey } from './constants.js';

const paddingXClasses = inject(PaddingXInjectKey, PADDING_X_CLASS_DEFAULT);
</script>