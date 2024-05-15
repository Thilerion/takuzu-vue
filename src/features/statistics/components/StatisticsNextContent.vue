<template>
<div class="space-y-6">
	<StatisticsOverview class="content-block" />
	<StatisticsActivity class="content-block" />
	<StatisticsRecentPuzzles class="content-block" />
</div>
</template>

<script setup lang="ts">
/*import { useStatisticsNextStore } from '../store.js';
const statsNextStore = useStatisticsNextStore(); */
</script>

<style scoped>
.content-block {
	@apply px-4 max-w-screen-sm mx-auto;
}
@media (width < 360px) {
	.content-block {
		@apply px-2;
	}
}
</style>