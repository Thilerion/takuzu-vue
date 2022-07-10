<template>
	<BasicLinkListItem wrapper-classes="py-1">
		<button
			@click="$emit('increment-debug-mode')"
			:disabled="debugMode"
			class="w-full h-full flex flex-row items-center text-start"
		>
			<div class="h-full min-w-fit flex flex-col justify-evenly text-start mr-5">
				<div>App version</div>
				<div v-if="shownPrevAppVersion" class="text-xs text-gray-800/50">Previous version</div>
			</div>
			<div
				class="inline-flex flex-col h-full justify-evenly min-w-0"
			>
				<div class="text-ellipsis">{{shownCurAppVersion[0]}}<span class="text-[0.875em] opacity-80 ml-px">+{{shownCurAppVersion[1]}}</span></div>
				<div v-if="shownPrevAppVersion" class="text-xs text-gray-800/50 text-ellipsis">{{shownPrevAppVersion}}</div>
			</div>
		</button>
	</BasicLinkListItem>
</template>

<script setup lang="ts">
import { useMainStore } from '@/stores/main';
import { computed, toRef, toRefs } from 'vue';

const emit = defineEmits(['increment-debug-mode']);

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

</style>