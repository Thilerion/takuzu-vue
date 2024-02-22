<template>
	<nav class="bg-white flex gap-x-2">
		<router-link
			class="px-3 py-2 inline-block"
			exact-active-class="border-b-2 border-b-teal-400 text-teal-600"
			v-for="tab in tabs"
			:to="{ name: tab.routeName }"
			:key="tab.label"
		>{{ tab.label }}</router-link>
	</nav>
</template>

<script setup lang="ts">
const tabs = [
	{
		label: 'Overview and Rules',
		routeName: 'OverviewAndRules'
	},
	{
		label: 'Basic Techniques',
		routeName: 'BasicTechniques'
	}
];

</script>

<style scoped>

</style>