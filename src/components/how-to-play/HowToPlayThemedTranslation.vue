<template>
	<i18n-t
		:tag="tag"
		:keypath="keypath"
		scope="global"
	>
		<template #symbolZero><PuzzleSymbolDisplay v="0" /></template>
		<template #symbolOne><PuzzleSymbolDisplay v="1" /></template>
		<template #symbolZeroPlural><PuzzleSymbolDisplay v="0" mult /></template>
		<template #symbolOnePlural><PuzzleSymbolDisplay v="1" mult /></template>
	</i18n-t>
</template>

<script setup lang="ts">
defineProps<{
	keypath: string,
	tag: string | undefined,
}>();
</script>

<style scoped>

</style>