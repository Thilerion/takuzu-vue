<template>
	<div>
		<PageHeader>Page not found</PageHeader>	
		<p>You will now be redirected to the main menu...</p>
	</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const timeout = ref<null | number>(null);
const router = useRouter();
onMounted(() => {
	timeout.value = setTimeout(() => {
		timeout.value = null;
		router.replace({ name: 'Home' });
	}, 2000);
})
onUnmounted(() => {
	if (timeout.value) {
		clearTimeout(timeout.value);
		timeout.value = null;
	}
})
</script>

<style scoped>
	
</style>