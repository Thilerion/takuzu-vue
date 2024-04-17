<template>
		<BaseDropdownItem @click="copyPuzzleString">
			<template #icon>
				<icon-heroicons-outline-clipboard-copy class="opacity-80 text-base" />
			</template>
			<span class="mt-px">{{ $t('PlayPuzzle.dd.copy-board-string') }}</span>
			<span v-if="copyError" class="ml-2 text-xs text-red-700 mt-px">{{ copyError }}</span>
		</BaseDropdownItem>
		<BaseDropdownItem @click="solvePuzzle">
			<span class="ml-8 mt-px">{{ $t('PlayPuzzle.dd.solve-puzzle') }}</span>
		</BaseDropdownItem>
		<BaseDropdownItem @click="solveInstantly">
			<span class="ml-8 mt-px">{{ $t('PlayPuzzle.dd.solve-instantly') }}</span>
		</BaseDropdownItem>
		<BaseDropdownItem @click="increasePuzzleTime">
			<template #icon>
				<IconIcOutlineMoreTime class="opacity-80 text-base" />
			</template>
			<span class="mt-px">{{ $t('PlayPuzzle.dd.increase-time-by-n-s', { n: 10 }) }}</span>
		</BaseDropdownItem>
		<BaseDropdownItem @click="solveTrios">
			<span class="ml-8 mt-px">{{ $t('PlayPuzzle.dd.solve-all-triples') }}</span>
		</BaseDropdownItem>
		<BaseDropdownItem @click="loadLastCorrectBoardState" :disabled="!canLoadLastCorrectState">
			<span class="ml-8 mt-px">{{ $t('PlayPuzzle.dd.load-last-correct-board-state') }}</span>
		</BaseDropdownItem>
</template>

<script setup lang="ts">
import { awaitRaf, awaitTimeout } from '@/utils/delay.utils.js';
import { EMPTY } from '@/lib/constants.js';
import { usePuzzleStore } from '@/stores/puzzle/store.js';
import { usePuzzleTimer } from '@/stores/puzzle/timer-store.js';
import { humanTriplesTechnique } from '@/lib/solvers/human-solver/techniques/TriplesTechnique.js';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { shuffleInPlace } from '@/utils/random.utils.js';
import { usePuzzleBookmarksStore } from '@/stores/bookmarks.js';
import { toRef } from 'vue';
import { SimpleBoard } from '@/lib/index.js';
import { computed } from 'vue';

const puzzleStore = usePuzzleStore();
const {
	board,
} = storeToRefs(puzzleStore);
const setCheatUsed = () => puzzleStore.cheatsUsed = true;
const copyError = ref<null | string>(null);

const emit = defineEmits<{
	(e: 'close'): void
}>();

const copyPuzzleString = async () => {
	try {
		const boardStr = board.value!.export();
		await navigator.clipboard.writeText(boardStr);
	} catch(e) {
		console.warn('could not copy to clipboard...');
		console.warn(e);
	}
	emit('close');
}
const solvePuzzle = async () => {
	emit('close');
	const emptyCells = [...board.value!.cells({ skipFilled: true })];
	if (emptyCells.length <= 1) return;

	setCheatUsed();
	const cells = shuffleInPlace(emptyCells.slice(0, -1));

	await awaitTimeout(500);

	let count = 0;
	for (const cell of cells) {
		const { x, y, value: prevValue } = cell;
		const solutionValue = puzzleStore.solution!.get(x, y);
		puzzleStore.makeMove({
			x, y, prevValue, value: solutionValue
		}, { historyCommitType: 'commit' });
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
	emit('close');
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
	emit('close');
	setCheatUsed();

	let movesFound = true;
	let count = 0;
	await awaitTimeout(400);

	while (movesFound) {
		const triplesHumanResult = humanTriplesTechnique({ board: board.value! });
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
				}, { historyCommitType: 'commit' })
				count += 1;
				if (count % 4 === 0) {
					await awaitRaf();
				}
			}
		}
	}
	console.log(`${count} values found with trios strategy.`);
}

const bookmarksStore = usePuzzleBookmarksStore();
const lastCorrectState = toRef(bookmarksStore, 'lastCorrectStateBookmark');
const canLoadLastCorrectState = computed(() => {
	const last = lastCorrectState.value;
	if (last == null) return false;
	return last.board !== puzzleStore.boardExportStr;
})
const loadLastCorrectBoardState = () => {
	if (!lastCorrectState.value) return;
	const exportStr = lastCorrectState.value.board;
	const board = SimpleBoard.import(exportStr);
	puzzleStore.loadBookmarkedPuzzleState(board);
	emit('close');
}
</script>

<style scoped>

</style>