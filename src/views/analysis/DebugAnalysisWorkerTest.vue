<template>
<div class="flex flex-row gap-2 flex-wrap w-full justify-center">
	<button
		:disabled="isActive"
		class="test-btn text-green-700"
		@click="sendSuccessMessage"
	>
		Test SUCCESS
	</button>
	<button
		:disabled="isActive"
		class="test-btn text-yellow-600"
		@click="sendFailureMessage"
	>
		Test FAILURE
	</button>
	<button
		:disabled="isActive"
		class="test-btn text-amber-700"
		@click="sendErrorMessage"
	>
		Test ERROR
	</button>
	<button
		:disabled="isActive"
		class="test-btn text-red-700"
		@click="sendUnhandledRejectionMessage"
	>
		Test UNHANDLED REJECTION
	</button>
	<button
		:disabled="isActive"
		class="test-btn"
		@click="sendEmptyMessage"
	>
		Test NO TASK
	</button>
</div>
<div class="h-6">
	<transition name="t-fade">
		<span v-if="isActiveDelayed">Request send...</span>
	</transition>
</div>
<div>Result:</div>
<div class="bg-green-100 text-green-900 min-h-[5rem] rounded flex items-center justify-start px-4 py-2">{{ messageResults }}</div>
<div class="min-h-[5rem] rounded bg-red-100 text-red-900 flex items-center justify-start px-4 py-2">{{ messageError }}</div>
</template>

<script setup lang="ts">
import * as analyzePuzzleWorker from '@/workers/analyze-puzzle';
import { onMounted, onUnmounted, ref } from 'vue';

const messageResults = ref('');
const messageError = ref('');
const isActive = ref(false);
const isActiveDelayed = ref(false);

const awaitTimeout = (length = 200) => {
	return new Promise((resolve) => {
		window.setTimeout(() => {
			resolve(undefined);
		}, length);
	})
}

async function sendMessage<T>(message: T): Promise<any> {
	if (isActive.value) return;
	let done = false;
	isActive.value = true;
	try {
		messageResults.value = '';
		messageError.value = '';
		const result = analyzePuzzleWorker.send(message).then(res => {
			done = true;
			return res;
		});
		awaitTimeout().then(() => {
			if (!done) isActiveDelayed.value = true;
		});
		messageResults.value = (await result) as any;
		return result;
	} catch (e) {
		done = true;
		messageError.value = e as any;
	} finally {
		isActive.value = false;
		isActiveDelayed.value = false;
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
	sendMessage(undefined);
}

onMounted(() => {
	analyzePuzzleWorker.initWorker();
})
onUnmounted(() => {
	analyzePuzzleWorker.terminate();
})
</script>

<style scoped>
.t-fade-enter-active {
	transition: opacity 0.05s ease;
}
/*.t-fade-leave-active {
	
}*/
.t-fade-enter-from, .t-fade-leave-to {
	opacity: 0;
}

.test-btn {
	@apply disabled:bg-gray-100 disabled:shadow-none disabled:border-gray-300 border border-transparent active:ring-2 transition-all duration-150 ring-blue-400 bg-white rounded p-2 shadow w-44 shrink-0 grow-1 font-medium;
}
</style>