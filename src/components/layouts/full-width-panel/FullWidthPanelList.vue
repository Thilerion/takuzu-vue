<template>
<div
	class="w-full fwp"
>
	<FwpBaseTitle
		v-if="$slots.sectionTitle"
		:class="[contentPaddingClass]"
		class="fwp-section-title"
	>
		<slot name="sectionTitle" />
	</FwpBaseTitle>

	<FwpBaseCard>
		<ul
			class="fwc-list divide-y divide-gray-150 bg-white dark:divide-slate-700 dark:bg-slate-800 rounded-xl link-list-shadow"
		><slot name="content">List goes here</slot></ul>
		<!-- To be used for content without padding x-padding -->
	</FwpBaseCard>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineSlots<{
	sectionTitle?: any;
	content?: any;
}>();

const contentPaddingClass = ref('px-6');
</script>

<style scoped>
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