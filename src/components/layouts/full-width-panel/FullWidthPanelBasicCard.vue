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
		<FwpBaseTitle
			v-if="$slots.cardTitle"
			:class="[contentPaddingClass]"
			class="fwp-card-header"
		>
			<slot name="cardTitle" />
		</FwpBaseTitle>
		<div
			:class="[contentPaddingClass]"
			class="fwp-content"
		>
			<slot name="content" />
		</div>
	</FwpBaseCard>
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