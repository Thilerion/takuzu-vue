<template>
	<BaseDropdown align-right align-below ref="dropdownRef" @toggled="dropdownToggled">
		<template #trigger="{ toggle }">
			<IconBtn @click="toggle" name="md-morevert">
				<icon-ic-baseline-more-vert />
			</IconBtn>
		</template>
		<template #content>
			<BaseDropdownItem disabled>
				<icon-ic-outline-bookmark-add class="opacity-80 text-base" />
				<span class="ml-3 mt-px">Set bookmark</span>
			</BaseDropdownItem>
			<BaseDropdownItem disabled>
				<icon-ic-outline-bookmark-remove class="opacity-80 text-base" />
				<span class="ml-3 mt-px">Delete bookmark</span>
			</BaseDropdownItem>
			<BaseDropdownDivider />
			<BaseDropdownItem>
				<label class="flex items-center">
					<input type="checkbox" v-model="showTimer">
					<span class="ml-2">Show timer</span>
				</label>
			</BaseDropdownItem>
			<BaseDropdownDivider />

			<template v-if="debugModeEnabled">
				<BaseDropdownItem @click="copyPuzzleString">
					<icon-heroicons-outline-clipboard-copy class="opacity-80 text-base" />
					<span class="ml-3 mt-px">Copy board string</span>
					<span v-if="copyError" class="ml-2 text-xs text-red-700 mt-px">{{ copyError }}</span>
				</BaseDropdownItem>
				<BaseDropdownItem @click="solvePuzzle">
					<span class="ml-7 mt-px">Solve puzzle</span>
				</BaseDropdownItem>
				<BaseDropdownItem @click="solveInstantly">
					<span class="ml-7 mt-px">Solve instantly</span>
				</BaseDropdownItem>
				<BaseDropdownItem @click="increasePuzzleTime">
					<span class="ml-7 mt-px">Increase time by 10s</span>
				</BaseDropdownItem>
				<BaseDropdownItem @click="solveTrios">
					<span class="ml-7 mt-px">Solve all trios</span>
				</BaseDropdownItem>
				<BaseDropdownDivider />
			</template>

			<BaseDropdownItem @click="goToSettings">
				<icon-ic-baseline-settings class="opacity-80" />
				<span class="ml-3 mt-px">Settings</span>
			</BaseDropdownItem>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import { useMainStore } from '@/stores/main.js';
import { useSettingsStore } from '@/stores/settings/store.js';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { toRef } from 'vue';
import BaseDropdown from '../global/dropdown/BaseDropdown.vue';
import { shuffle } from '@/lib/utils.js';
import { awaitRaf, awaitTimeout } from '@/utils/delay.utils.js';
import { humanSolveTriples } from '@/lib/human-solver/triples.js';
import { EMPTY } from '@/lib/constants.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { usePuzzleTimer } from '@/stores/puzzle/timer-store.js';

const settingsStore = useSettingsStore();
const showTimer = toRef(settingsStore, 'showTimer');

const puzzleStore = usePuzzleStore();
const {
	board,
} = storeToRefs(puzzleStore);
const setCheatUsed = () => puzzleStore.cheatsUsed = true;

const mainStore = useMainStore();
const debugModeEnabled = toRef(mainStore, 'debugMode');

const copyError = ref<null | string>(null);

const emit = defineEmits<{
	'open-settings': [],
	'dropdown-toggled': [val: boolean]
}>();
const dropdownRef = ref<InstanceType<typeof BaseDropdown> | null>(null);
const closeDD = () => dropdownRef.value!.closeDropdownMenu();

const goToSettings = () => {
	closeDD();
	emit('open-settings');
}

const copyPuzzleString = async () => {
	try {
		const boardStr = board.value!.export();
		await navigator.clipboard.writeText(boardStr);
	} catch(e) {
		console.warn('could not copy to clipboard...');
		console.warn(e);
	}
	closeDD();
}
const solvePuzzle = async () => {
	closeDD();
	const emptyCells = [...board.value!.cells({ skipFilled: true })];
	if (emptyCells.length <= 1) return;

	setCheatUsed();
	const cells = shuffle(emptyCells.slice(0, -1));

	await awaitTimeout(500);

	let count = 0;
	for (const cell of cells) {
		const { x, y, value: prevValue } = cell;
		const solutionValue = puzzleStore.solution!.get(x, y);
		puzzleStore.makeMove({
			x, y, prevValue, value: solutionValue
		}, { historyAction: 'commit' });
		count += 1;

		if (count % 4 === 0) {
			await awaitRaf();
		}
	}
}

const increasePuzzleTime = () => {
	setCheatUsed();
	const timer = usePuzzleTimer();
	timer.timeElapsed += 10000;
}
const solveInstantly = async () => {
	closeDD();
	const emptyCells = [...board.value!.cells({ skipFilled: true })];
	if (emptyCells.length <= 1) return;

	setCheatUsed();
	const moves = emptyCells.slice(0, -1).map(cell => {
		const { x, y, value: prevValue } = cell;
		const value = puzzleStore.solution!.get(x, y);
		return { x, y, value, prevValue };
	})
	puzzleStore.assignToBoard(moves, {
		handleGridCounts: "refresh",
		handleMarkedMistakes: "reset"
	});
}

const solveTrios = async () => {
	closeDD();
	setCheatUsed();

	let movesFound = true;
	let count = 0;
	await awaitTimeout(400);

	while (movesFound) {
		const triplesHumanResult = humanSolveTriples({ board: board.value! });
		if (!triplesHumanResult || !triplesHumanResult.length) {
			movesFound = false;
			break;
		}
		for (const move of triplesHumanResult) {
			for (const target of move.targets) {
				const { x, y, value } = target;
				const prevValue = puzzleStore.board!.grid[y][x];
				if (prevValue !== EMPTY) continue;
				puzzleStore.makeMove({
					x, y, value, prevValue
				}, { historyAction: 'commit' })
				count += 1;
				if (count % 4 === 0) {
					await awaitRaf();
				}
			}
		}
	}
	console.log(`${count} values found with trios strategy.`);
}
const dropdownToggled = (val: boolean) => {
	emit('dropdown-toggled', val);
}
</script>

<style scoped>

</style>