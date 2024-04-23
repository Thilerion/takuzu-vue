<template>
	<div>
		<PageHeader
			hide-back
		>{{ $t('NotFound404.page-not-found') }}</PageHeader>	
		<p>{{ $t('NotFound404.you-will-be-redirected-main-menu') }}</p>
	</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const timeout = ref<null | number>(null);
const router = useRouter();
onMounted(() => {
	timeout.value = window.setTimeout(() => {
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