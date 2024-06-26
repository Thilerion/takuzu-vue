<template>
<FullWidthPanelList class="text-start">
	<template #sectionTitle>Feature Toggles</template>
	<template #content>
		<FullWidthPanelListItem
			v-for="(feature) in features"
			:key="feature.value.label"
		>
			<label class="flex items-center justify-start gap-x-4 pl-2 w-full">
				<input
					type="checkbox"
					:checked="feature.value.toggleValue"
					@change="updateValueWithDelay(feature, $event)"
				>{{ feature.value.label }}</label>
		</FullWidthPanelListItem>
	</template>
</FullWidthPanelList>
</template>

<script setup lang="ts">
import { useMainStore } from '@/stores/main.js';
import { useDebounceFn } from '@vueuse/core';
import { toRefs, type Ref } from 'vue';
import type { FeatureData } from '../composables/debug-mode-features.js';

const mainStore = useMainStore();
const features = toRefs(mainStore.featureToggles);

const updateValue = (feature: Ref<FeatureData>, ev: Event) => {
	const target = ev.target as HTMLInputElement;
	const value = target?.checked ?? false;
	feature.value.toggleValue = value;
	target.checked = value;
}

const updateValueWithDelay = useDebounceFn(updateValue, 250, { maxWait: 600 });
</script>