<template>
	<div class="activity px-4">
		<h2 class="text-gray-600 text-lg font-medium px-1 py-2">Play activity</h2>
		<div class="bg-white rounded shadow divide-y">
			<StatsHeatmap/>
				<div class="flex flex-row px-6 py-4">
				<div class="w-40">Best streak</div>
				<div>16</div>
			</div>
			<div class="flex flex-row px-6 py-4">
				<div class="w-40">Current streak</div>
				<div>7 🔥</div>
		</div>
			</div>
	</div>
</template>

<script setup>
import StatsHeatmap from './StatsHeatmap.vue';

</script>

<style scoped>

</style>