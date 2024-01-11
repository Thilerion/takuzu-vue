<template>
	<button
		class="bg-slate-800/80 text-white rounded p-2 w-full text-left pl-4 max-w-md mx-auto flex flex-col"
		v-show="show"
		@click="updateAndReload"
	>
		<span>A new version is available!</span>
		<span class="text-xs">Click here to update (will take just a second).</span>
	</button>
</template>

<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue';
import { computed, watchEffect } from 'vue';
const { needRefresh, updateServiceWorker } = useRegisterSW();

const show = computed(() => needRefresh.value);

const emit = defineEmits([
	'displayed'
])

const updateAndReload = () => {
	updateServiceWorker(true);
};

watchEffect(() => {
	emit('displayed', show.value);
})

</script>

<style scoped>
.clamped-container {
	/* max-width: clamp(10ch, 100rem, 90vw); */
	
}
</style>