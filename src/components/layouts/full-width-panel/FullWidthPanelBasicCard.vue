<template>
<div
	class="w-full fwp"
>
	<h2
		v-if="$slots.sectionTitle"
		:class="[contentPaddingClass]"
		class="fwp-section-title font-medium text-gray-700/90 dark:text-slate-300 tracking-wide"
	>
		<slot name="sectionTitle" />
	</h2>

	<div
		class="bg-white rounded-xl fwp-card-shadow"
	>
		<h2
			v-if="$slots.cardTitle"
			:class="[contentPaddingClass]"
			class="fwp-card-header font-medium inline-block text-gray-700/90 dark:text-slate-300 tracking-wide"
		>
			<slot name="cardTitle" />
		</h2>
		<div
			:class="[contentPaddingClass]"
			class="fwp-content"
		>
			<slot name="content" />
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineSlots<{
	sectionTitle?: any;
	cardTitle?: any;
	content: any;
}>();

const contentPaddingClass = ref('px-6');
</script>

<style scoped>
.fwp-card-shadow {
	box-shadow: rgba(0, 0, 0, 0.05) 0px 5px 20px, 0 8px 15px -2px rgb(0 0 0 / 0.04);
}

.fwp-section-title {
	@apply mb-1;
}

.fwp-card-header {
	@apply py-3;
}

.fwp-content {
	@apply pt-4 pb-4;
}
.fwp:has(.fwp-card-header) .fwp-content {
	@apply pt-0;
}
</style>