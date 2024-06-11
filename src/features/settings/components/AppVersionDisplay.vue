<template>
<BasicLinkListItem wrapper-classes="py-0">
	<button
		:disabled="debugMode"
		class="app-v-btn w-full h-full grid text-start gap-x-8 justify-start content-center"
		@click="$emit('increment-debug-mode')"
	>
		<div
			class="col-start-1 col-end-2 row-start-1 row-end-2 whitespace-nowrap"
		>{{ $t('Settings.version.app') }}</div>

		<div
			class="text-ellipsis overflow-x-hidden max-w-full min-w-0 whitespace-nowrap col-start-2 row-start-1 row-end-2"
		>{{ shownCurAppVersion[0] }}<span class="text-[0.875em] opacity-80 ml-px">+{{ shownCurAppVersion[1] }}</span></div>

		<template v-if="shownPrevAppVersion">
			<div class="whitespace-nowrap text-xs text-gray-800/50 col-start-1 col-end-2 row-start-2">{{ $t('Settings.version.previous') }}</div>			
			<div class="text-ellipsis overflow-x-hidden max-w-full min-w-0 whitespace-nowrap text-xs text-gray-800/50 col-start-2 row-start-2">{{ shownPrevAppVersion }}</div>
		</template>
	</button>
</BasicLinkListItem>
</template>

<script setup lang="ts">
import { useMainStore } from '@/stores/main';
import { computed, toRef, toRefs } from 'vue';

const emit = defineEmits<{
	'increment-debug-mode': []
}>();

const props = defineProps<{
	debugMode: boolean
}>();

const mainStore = useMainStore();
const buildDetails = toRef(mainStore, 'buildDetails');
const { curAppVersionData, prevAppVersionData, metadata } = toRefs(buildDetails.value);

const shownCurAppVersion = computed(() => {
	if (props.debugMode) {
		return [curAppVersionData.value.pkgVersion, metadata.value];
	} else {
		return [curAppVersionData.value.pkgVersion, curAppVersionData.value.buildDateString];
	}
})
const hasPrevAppVersionData = computed(() => prevAppVersionData.value != null);
const shownPrevAppVersion = computed(() => {
	if (props.debugMode && hasPrevAppVersionData.value) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return prevAppVersionData.value!.detailedVersion;
	} else {
		return null;
	}
})
</script>

<style scoped>
.app-v-btn {
	grid-template-columns: auto auto;
}
</style>