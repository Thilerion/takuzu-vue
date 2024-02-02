<template>
	<div class="how-to-play flex flex-col pb-4">
		<PageHeader class="flex-shrink-0 relative z-10" :elevated="true /* TODO: set to false when tabs are implemented */">How to play</PageHeader>
		<HowToPlayOverview class="bg-white relative z-0 px-8 pt-6" />
	</div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.how-to-play {
	@apply overflow-x-hidden fixed inset-0 overscroll-y-auto;
}
</style>