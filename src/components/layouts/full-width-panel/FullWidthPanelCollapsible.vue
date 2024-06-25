<template>
<div
	class="w-full fwp fwp-collapsible"
>
	<BaseCollapsible
		v-slot="{ isOpen }"
		class="bg-white rounded-xl fwp-card-shadow"
		:default-open="defaultOpen"
	>
		<BaseCollapsibleTrigger
			:class="[contentPaddingClass]"
			class="fwp-card-header fwp-trigger font-medium inline-block text-gray-700/90 dark:text-slate-300 tracking-wide"
			tag="button"
		>
			<slot name="cardTitle">Collapsible block title</slot>
			<icon-ic-outline-keyboard-arrow-down
				class="ml-auto transition-transform duration-500 text-base"
				:class="{ 'rotate-180': isOpen }"
			/>
		</BaseCollapsibleTrigger>
		<BaseCollapsibleContent
			:class="[contentPaddingClass]"
		>
			<div
				class="fwp-content"
			>
				<slot name="content" />			
			</div>
		</BaseCollapsibleContent>
	</BaseCollapsible>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineSlots<{
	cardTitle: any;
	content: any;
}>();

export type FWPCollapsibleProps = {
	defaultOpen?: boolean,
}
const props = defineProps<FWPCollapsibleProps>();

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

/* Collapsible block: specific styles */
.fwp-trigger {
	@apply w-full text-start hocus-notouch:bg-gray-100 flex items-center justify-between;
}
.fwp-collapsible .fwp-content {
	@apply first:pt-1;
}
</style>