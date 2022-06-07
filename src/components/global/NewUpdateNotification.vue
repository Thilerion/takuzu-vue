<template>
	<div class="z-10 absolute top-0 inset-x-0 flex items-center justify-start pt-2 px-2 text-left">
		<button
			class="bg-slate-800/80 text-white rounded p-2 w-full text-left pl-4 text-sm max-w-md mx-auto"
			v-if="needRefresh"
			@click="updateAndReload"
		>
			<span>A new version is available</span>
			<span class="text-xs ml-4">Click here to update</span>
		</button>
	</div>
</template>

<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue';
const { needRefresh, updateServiceWorker } = useRegisterSW();

const updateAndReload = () => {
	updateServiceWorker(true);
};

</script>

<style scoped>

</style>