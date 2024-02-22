<template>
	<div class="flex flex-col overflow-y-auto">
		<PageHeader
			class="bg-white shadow-sm"
			small
			:back-options="{ type: 'force', prevRouteName: 'Statistics' }"
		>Puzzle statistics</PageHeader>
		<div class="pt-4">
			<StatsMostPlayedList />
		</div>
	</div>
</template>

<script setup lang="ts">
</script>

<style scoped>

</style>