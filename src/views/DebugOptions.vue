<template>
<div class="flex flex-col flex-1">
	<PageHeader
		small
		:elevated="true"
		:transparent="false"
		back-options="Settings"
	>Debug Options</PageHeader>
	<div class="flex-1 flex flex-col">
		<FullWidthPanelLayout>
			<DebugMenu class="mt-6" />
			<DebugFeatureToggles class="mt-6" />
		</FullWidthPanelLayout>
	</div>
</div>
</template>

<script setup lang="ts">
import { onBeforeMount, onUnmounted } from 'vue';

// Allow body overscroll to enable pull to refresh whenever debug/dev options is open
onBeforeMount(() => {
	document.body.classList.add('allow-overscroll-y');
})
onUnmounted(() => {
	document.body.classList.remove('allow-overscroll-y');
})
</script>

<style>
body.allow-overscroll-y {
	overscroll-behavior-y: auto;
}
</style>