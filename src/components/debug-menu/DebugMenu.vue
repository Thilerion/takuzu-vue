<template>
	<div class="text-left">
		<BasicListHeader>Debug mode options</BasicListHeader>
		<BasicLinkList>
			<BasicLinkListItem>
			<router-link class="list-btn" to="/showcase">Open component showcase</router-link>
			</BasicLinkListItem>
			<BasicLinkListItem><button class="list-btn" @click="clearPuzzleDbAction">Clear pregen puzzle db</button></BasicLinkListItem>
			<BasicLinkListItem><button class="list-btn" @click="initPregenPuzzles">Pregen puzzles</button></BasicLinkListItem>
		</BasicLinkList>
		<div class="db-results relative pt-4">
			<transition-group name="t-note">
				<div class="h-8 flex items-center justify-start overflow-hidden will-change-[height]" v-for="value in clearPuzzlesResult" :key="value.id">
					<p class="text-sm text-left px-6 font-bold tracking-wider text-gray-600" >{{value.str}}</p>
				</div>
			
			</transition-group>
		</div>
	</div>
</template>

<script setup lang="ts">
import { initPregenPuzzles as initPregenPuzzlesWorker, clearPregenPuzzlesDb } from '@/workers/pregen-puzzles/interface.js';
import { ref } from 'vue';

const clearPuzzlesResult = ref<{ str: string, id: number }[]>([]);
let notificationId = -1;
const addDbResultNotification = (str: string, timeout = 2000) => {
	const id = ++notificationId;
	clearPuzzlesResult.value.push({str, id});
	window.setTimeout(() => {
		clearPuzzlesResult.value = clearPuzzlesResult.value.filter(val => val.id !== id);
	}, timeout);
}

const clearPuzzleDbAction = async () => {	
	try {
		addDbResultNotification('Resetting pregenerated puzzle database now...');
		const result = await Promise.all([
			clearPregenPuzzlesDb(),
			awaitTimeout()
		])
		const clearDbResult = result[0];
		console.log(clearDbResult);
		addDbResultNotification('Successfully cleared puzzle database.');
		return true;
	} catch(e) {
		console.warn(e);
		addDbResultNotification('Error while clearing puzzles...\n' + e);
		return false;
	}
}

const awaitTimeout = async (timeout = 1000) => {
	return new Promise<void>((resolve) => {
		window.setTimeout(() => {
			resolve();
		}, timeout)
	})
}

const initPregenPuzzles = async () => {
	try {
		await clearPregenPuzzlesDb();
		addDbResultNotification('Now generating puzzles.', 20000);
		const result = await Promise.all([
			initPregenPuzzlesWorker(),
			awaitTimeout()
		]);
		const initPregenWorkerResult = result[0];
		console.log(initPregenWorkerResult);
		addDbResultNotification('Succesfully generated puzzles.', 10000);
	} catch(e) {
		console.warn(e);
		addDbResultNotification('Could not pregen puzzles; ' + e);
	}
}
</script>

<style scoped>
.t-note-enter-active {
	transition: opacity 0.1s 0.05s, height 0.2s;
}
.t-note-leave-active {
	transition: opacity 1s ease;
	@apply transition-all duration-1000 ease-in-out h-5 delay-500;
}
.t-note-enter-from, .t-note-leave-to {
	@apply opacity-0 h-0;
}
.t-note-move {
	transition: all 0.2s ease 0.6s;
}
</style>