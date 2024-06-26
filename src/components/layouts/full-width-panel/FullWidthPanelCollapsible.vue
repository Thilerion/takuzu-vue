<template>
<div
	class="w-full fwp fwp-collapsible"
>
	<BaseCollapsible
		v-slot="{ isOpen }"
		v-model="internalModelValue"
		:default-open="defaultOpen"
	>
		<FwpBaseCard>
			<BaseCollapsibleTrigger
				:class="[contentPaddingClass]"
				class="fwp-card-header fwp-trigger"
				tag="button"
			>
				<FwpBaseTitle tag="div"><slot name="cardTitle">Collapsible block title</slot></FwpBaseTitle>
				<BaseOpenClosedIcon :open="isOpen" />
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
		</FwpBaseCard>
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

const internalModelValue = defineModel<boolean | undefined>({ default: undefined });
const props = withDefaults(defineProps<FWPCollapsibleProps>(), {
	defaultOpen: false
});

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

/* Collapsible block: specific styles */
.fwp-trigger {
	@apply w-full rounded-xl text-start hover-notouch:bg-gray-100 hover-hover:active:bg-gray-200  flex items-center justify-between;
}
.fwp-collapsible .fwp-content {
	@apply first:pt-1;
}
</style>