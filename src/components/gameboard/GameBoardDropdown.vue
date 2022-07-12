<template>
	<BaseDropdown
		align-right
		align-below
		ref="dropdown"
		@toggled="dropdownToggled"
	>
		<template #trigger="{toggle}">
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
			<BaseDropdownDivider/>
			<BaseDropdownItem>
				<label class="flex items-center">
					<input type="checkbox" v-model="showTimer">
					<span class="ml-2">Show timer</span>
				</label>
			</BaseDropdownItem>
			<BaseDropdownDivider/>

			<template v-if="debugModeEnabled">
				<BaseDropdownItem @click="copyPuzzleString">
					<icon-heroicons-outline-clipboard-copy class="opacity-80 text-base"/>
					<span class="ml-3 mt-px">Copy board string</span>
					<span v-if="copyError" class="ml-2 text-xs text-red-700 mt-px">{{copyError}}</span>
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
				<BaseDropdownDivider/>
			</template>

			<BaseDropdownItem @click="goToSettings"
			>
				<icon-ic-baseline-settings class="opacity-80" />
				<span class="ml-3 mt-px">Settings</span>
			</BaseDropdownItem>
		</template>
	</BaseDropdown>
</template>

<script>
import { EMPTY } from '@/lib/constants';
import { humanSolveTriples } from '@/lib/human-solver/triples.';
import { shuffle } from '@/lib/utils';
import { useMainStore } from '@/stores/main';
import { usePuzzleTimer } from '@/stores/puzzle-timer';
import { usePuzzleStore } from '@/stores/puzzle.js';
import { useSettingsStore } from '@/stores/settings/store';
import { awaitTimeout, awaitRaf } from '@/utils/delay.utils';
import { storeToRefs } from 'pinia';
import { readonly, toRef } from 'vue';

export default {
	emits: ['open-settings', 'dropdown-toggled'],
	setup() {
		const settingsStore = useSettingsStore();
		const showTimer = toRef(settingsStore, 'showTimer');

		const puzzleStore = usePuzzleStore();
		const {
			board,
		} = storeToRefs(puzzleStore);
		const setCheatUsed = () => puzzleStore.setCheatUsed();

		const mainStore = useMainStore();
		const debugMode = toRef(mainStore, 'debugMode');

		return {
			showTimer,

			puzzleStore,
			board,

			setCheatUsed,

			debugModeEnabled: readonly(debugMode)
		};
	},
	data() {
		return {
			copyError: null
		}
	},
	methods: {
		goToSettings() {
			this.$refs.dropdown.closeDropdownMenu();
			this.$emit('open-settings');
		},
		async copyPuzzleString() {
			try {
				const boardStr = this.board.export();
				await navigator.clipboard.writeText(boardStr);
				console.log('copied to clipboard!');
				console.log(boardStr);		
			} catch(e) {
				console.warn('could not copy to clipboard...');
				console.warn(e);
			}
			this.$refs.dropdown.closeDropdownMenu();
		},
		async solvePuzzle() {
			this.$refs.dropdown.closeDropdownMenu();

			const emptyCells = [...this.board.cells({ skipFilled: true} )];
			if (emptyCells.length <= 1) return;

			this.setCheatUsed();


			const cells = shuffle(emptyCells.slice(0, -1));

			await awaitTimeout(500);

			let count = 0;

			for (const cell of cells) {
				const { x, y, value: prevValue } = cell;
				const solutionValue = this.puzzleStore.solution.get(x, y);
				this.puzzleStore.makeMove({
					x, y, prevValue, value: solutionValue
				})
				count += 1;

				if (count % 4 === 0) {
					await awaitRaf();
				}
			}			
		},
		increasePuzzleTime() {
			this.setCheatUsed();
			const puzzleTimer = usePuzzleTimer();
			puzzleTimer.timeElapsed += 10000;
		},
		async solveInstantly() {
			this.$refs.dropdown.closeDropdownMenu();
			const emptyCells = [...this.board.cells({ skipFilled: true} )];
			if (emptyCells.length <= 1) return;

			this.setCheatUsed();

			const moves = emptyCells.slice(0, -1).map(cell => {
				const { x, y, value: prevValue } = cell;
				const value = this.puzzleStore.solution.get(x, y);
				return { x,y, value,prevValue};
			})
			this.puzzleStore.setMultipleValues(moves);
		},
		async solveTrios() {
			this.$refs.dropdown.closeDropdownMenu();
			this.setCheatUsed();

			const board = this.board;

			let movesFound = true;
			let count = 0;

			await awaitTimeout(400);

			while (movesFound) {
				const triplesHumanResult = humanSolveTriples({ board });
				if (!triplesHumanResult || !triplesHumanResult.length) {
					movesFound = false;
					break;
				}
				
				for (const move of triplesHumanResult) {
					for (const target of move.targets) {
						const { x, y, value } = target;
						const prevValue = this.puzzleStore.board.grid[y][x];
						if (prevValue !== EMPTY) continue;
						this.puzzleStore.makeMove({
							x, y, value, prevValue
						})
						count += 1;
						if (count % 4 === 0) {
							await awaitRaf();
						}
					}
				}
			}
			console.log(`${count} values found with trios strategy.`);
		},
		dropdownToggled(value) {
			this.$emit('dropdown-toggled', value);
		}
	}
};
</script>

<style scoped>
	
</style>