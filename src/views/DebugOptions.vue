<template>
	<div class="flex flex-col flex-1">
		<PageHeader
			small
			:elevated="true"
			:transparent="false"
		>Debug Options</PageHeader>
		<div class="flex-1 text-center flex flex-col">
			<DebugMenu
				class="mt-6"
			/>
			<DebugFeatureToggles
				class="mt-6"
			/>
		</div>
	</div>
</template>

<script setup>
import DebugMenu from '@/components/debug-menu/DebugMenu.vue';
import DebugFeatureToggles from '@/components/debug-menu/DebugFeatureToggles.vue';
</script>

<style scoped>

</style>