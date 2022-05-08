<template>
	<div class="flex flex-col overflow-y-auto">
		<PageHeader class="bg-white shadow-sm" small>Puzzle statistics</PageHeader>
		<div class="pt-4">
			<StatsMostPlayedList />
		</div>
	</div>
</template>

<script setup>
import PageHeader from '@/components/global/base-layout/PageHeader.vue';
import StatsMostPlayedList from '@/components/statistics/StatsMostPlayedList.vue';
</script>

<style scoped>

</style>