<template>
	<div class="overflow-x-hidden fixed inset-0 overscroll-y-auto flex flex-col pb-8">
		<PageHeader :transparent="false" small elevated class="flex-shrink-0">Puzzle Analysis</PageHeader>
		<div class="flex-1 pt-4">
			<main class="gap-y-4 grid bleed-grid-4 v-grid-bleed text-sm">
				<div class="flex flex-row gap-2 flex-wrap w-full justify-center">
					<button class="bg-white rounded p-2 shadow w-44 shrink-0 grow-1 text-green-700 font-medium" @click="sendSuccessMessage">Test SUCCESS</button>
					<button class="bg-white rounded p-2 shadow w-44 shrink-0 grow-1 text-yellow-600 font-medium" @click="sendFailureMessage">Test FAILURE</button>
					<button class="bg-white rounded p-2 shadow w-44 shrink-0 grow-1 text-amber-700 font-medium" @click="sendErrorMessage">Test ERROR</button>
					<button class="bg-white rounded p-2 shadow w-44 shrink-0 grow-1 text-red-700 font-medium" @click="sendUnhandledRejectionMessage">Test UNHANDLED REJECTION</button>
					<button class="bg-white rounded p-2 shadow w-44 shrink-0 grow-1 font-medium" @click="sendEmptyMessage">Test NO TASK</button>
				</div>
				<div class="h-6"><span v-if="isActive">Request send...</span></div>
				<div>Result:</div>
				<div class="bg-green-100 text-green-900 min-h-[5rem] rounded flex items-center justify-start px-4 py-2">{{messageResults}}</div>
				<div class="min-h-[5rem] rounded bg-red-100 text-red-900 flex items-center justify-start px-4 py-2">{{messageError}}</div>
			</main>
		</div>
	</div>
</template>

<script setup>
import * as analyzePuzzleWorker from '@/workers/analyze-puzzle';
import { onMounted, onUnmounted, ref } from 'vue';

const messageResults = ref('');
const messageError = ref('');
const isActive = ref(false);
const sendMessage = async (message) => {
	if (isActive.value) return;
	try {
		messageResults.value = '';
		messageError.value = '';
		isActive.value = true;
		const result = await analyzePuzzleWorker.send(message);
		messageResults.value = result;
		return result;
	} catch(e) {
		messageError.value = e;
	} finally {
		isActive.value = false;
	}
}
const sendSuccessMessage = () => {
	sendMessage({ task: 'test-success' });
}
const sendErrorMessage = () => {
	sendMessage({ task: 'test-error' });
}
const sendFailureMessage = () => {
	sendMessage({ task: 'test-failure' });
}
const sendUnhandledRejectionMessage = () => {
	sendMessage({ task: 'test-unhandledrejection'});
}
const sendEmptyMessage = () => {
	sendMessage();
}

onMounted(() => {
	analyzePuzzleWorker.initWorker();
})
onUnmounted(() => {
	analyzePuzzleWorker.terminate();
})
</script>

<style scoped>

</style>