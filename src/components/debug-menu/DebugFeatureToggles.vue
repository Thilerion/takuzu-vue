<template>
<div class="text-left">
	<BasicListHeader>Feature Toggles</BasicListHeader>
	<BasicLinkList>
		<BasicLinkListItem
			v-for="(feature) in features"
			:key="feature.value.label"
			:wrapper-classes="'relative'"
		>
			<label class="absolute inset-0 flex items-center justify-start gap-x-4 pl-2">
				<input
					type="checkbox"
					:checked="feature.value.toggleValue"
					@change="updateValueWithDelay(feature, $event)"
				>{{ feature.value.label }}</label>
		</BasicLinkListItem>
	</BasicLinkList>
</div>
</template>

<script setup lang="ts">
import type { FeatureData } from '@/stores/composables/useFeatureToggle';
import { useMainStore } from '@/stores/main';
import { useDebounceFn } from '@vueuse/core';
import { toRefs, type Ref } from 'vue';

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