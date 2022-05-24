<template>
	<div class="text-left">
		<BasicListHeader>Feature Toggles</BasicListHeader>
		<BasicLinkList>
			<BasicLinkListItem
				v-for="(feature) in features"
				:key="feature.value.name"
				:wrapper-classes="'relative'"
			><label class="absolute inset-0 flex items-center justify-start gap-x-4 pl-2"><input type="checkbox" v-model="feature.value.toggleValue">{{feature.value.label}}</label></BasicLinkListItem>
		</BasicLinkList>
	</div>
</template>

<script setup>
import { useMainStore } from '@/stores/main';
import { toRefs } from 'vue';

const mainStore = useMainStore();
const features = toRefs(mainStore.featureToggles);

</script>