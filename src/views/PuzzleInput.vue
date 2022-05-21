<template>
	<div class="flex flex-col pb-12 overflow-x-hidden fixed inset-0 overscroll-y-auto">
		<PageHeader :transparent="false" small elevated class="flex-shrink-0">Puzzle Input</PageHeader>
		<div class="flex-1 flex flex-col">
		<PuzzleInputInner />
		</div>
	</div>
</template>

<script setup>
import PuzzleInputInner from './PuzzleInputInner.vue';

</script>

<style scoped>

</style>