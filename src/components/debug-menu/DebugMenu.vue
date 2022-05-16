<template>
	<div class="text-left">
		<h2 class="font-medium mb-1 text-gray-700/90 tracking-wide px-6">Debug mode options</h2>
		<div class="divide-y divide-gray-150 bg-white px-4 rounded-xl shadow-lg">
			<router-link class="list-btn" to="/showcase">Open component showcase</router-link>
			<button class="list-btn" @click="disableDebugMode">Disable debug mode</button>
			<button class="list-btn" @click="clearPuzzleDbAction">Clear pregen puzzle db</button>
			<button class="list-btn" @click="initPregenPuzzles">Pregen puzzles</button>
		</div>
		<div class="db-results relative">
			<transition-group name="t-note">
			<p class="text-sm text-left mt-4 px-6 font-bold tracking-wider text-gray-600" v-for="value in clearPuzzlesResult" :key="value.id">{{value.str}}</p>
			</transition-group>
		</div>
	</div>
</template>

<script setup>
import { useMainStore } from '@/stores/main.js';
import { clearPuzzleDb } from '@/services/puzzles-db/db.js';
import { initPregenWorker } from '@/workers/pregen-puzzles.js';
import { ref, computed } from 'vue';

const emit = defineEmits(['reset-debug-counter']);

const mainStore = useMainStore();
const disableDebugMode = () => {
	mainStore.setDebugMode(false);
	emit('reset-debug-counter');
}

const clearPuzzlesResult = ref([]);
let notificationId = -1;
const addDbResultNotification = (str, timeout = 2000) => {
	const id = ++notificationId;
	clearPuzzlesResult.value.push({str, id});
	setTimeout(() => {
		clearPuzzlesResult.value = clearPuzzlesResult.value.filter(val => val.id !== id);
	}, timeout);
}

const clearPuzzleDbAction = async () => {	
	try {
		addDbResultNotification('Resetting pregenerated puzzle database now...');
		const [result, timeoutResult] = await Promise.all([
			clearPuzzleDb(),
			awaitTimeout()
		])
		console.log(result);
		addDbResultNotification('Successfully cleared puzzle database.');
		return true;
	} catch(e) {
		console.warn(e);
		addDbResultNotification('Error while clearing puzzles...\n' + e);
		return false;
	}
}

const awaitTimeout = async (timeout = 1000) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, timeout)
	})
}

const initPregenPuzzles = async () => {
	try {
		await clearPuzzleDb();
		addDbResultNotification('Now generating puzzles.', 20000);
		const [result, timeoutResult] = await Promise.all([
			initPregenWorker(),
			awaitTimeout()
		])
		console.log(result);
		addDbResultNotification('Succesfully generated puzzles.', 10000);
	} catch(e) {
		console.warn(e);
		addDbResultNotification('Could not pregen puzzles; ' + e);
	}
}
</script>

<style scoped>
.list-btn {
	@apply w-full flex items-center justify-start text-left min-h-[28px] px-2 py-4 bg-white;
}

.t-note-enter-active {
	transition: opacity 0.1s;
}
.t-note-leave-active {
	transition: opacity 1s ease;
	position: absolute;
}
.t-note-enter-from, .t-note-leave-to {
	opacity: 0;
}
.t-note-move {
	transition: all 0.2s ease 0.6s;
}
</style>