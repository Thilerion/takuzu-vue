<template>
	<div class="text-left">
		<BasicListHeader>Feature Toggles</BasicListHeader>
		<BasicLinkList>
			<BasicLinkListItem
				v-for="(feature) in features"
				:key="feature.value.name"
				:wrapper-classes="'relative'"
			><label class="absolute inset-0 flex items-center justify-start gap-x-4 pl-2"><input type="checkbox" @change="updateValueWithDelay(feature, $event.target.checked, $event)" :checked="feature.value.toggleValue">{{feature.value.label}}</label></BasicLinkListItem>
		</BasicLinkList>
	</div>
</template>

<script setup>
import { useMainStore } from '@/stores/main';
import { useDebounceFn } from '@vueuse/core';
import { toRefs } from 'vue';

const mainStore = useMainStore();
const features = toRefs(mainStore.featureToggles);

const updateValueWithDelay = useDebounceFn((featureRef, value, ev) => {
	featureRef.value.toggleValue = value;
	ev.target.checked = value;
}, 250, { maxWait: 600 });
</script>