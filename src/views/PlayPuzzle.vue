<template>
	<div class="play-puzzle fixed box-border overflow-auto inset-0 flex flex-col z-20 text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white" :class="{'puzzle-paused': paused, 'puzzle-finished': finished }">
		<button class="absolute mt-16 bg-red-200" v-if="finished && $store.state.stats.modalHidden" @click="$store.commit('stats/setModalVisibility', false)">open again</button>

		<GameBoardHeader
			class="flex-shrink-0"
			@close="exitGame"
			@dropdown-toggled="dropdownToggled"
			:rows="rows"
			:columns="columns"	
		/>
		<GameBoardWrapper
			:ruler-height="rulerSize"
			:ruler-width="rulerSize"
			:info-height="'21px'"
			:rows="rows"
			:columns="columns"
			v-slot="{width, height, cellSize}"
		>
			<GameBoard
				v-if="started && board"
				:paused="paused"
				:rows="rows"
				:columns="columns"
				:board="board"
				:initial-board="initialBoard"
				:ruler-size="rulerSize"
				:ruler-type="rulerType"
				:grid-height="height"
				:grid-width="width"
				:cell-size="cellSize"
			>
				<template v-slot:puzzle-info>
					<PuzzleInfo
						:show-timer="showTimer"
						:difficulty="difficulty"
						:progress="progress"
					/>
				</template>
				<template v-slot:ruler-rows>
					<RulerCoords v-if="rulerType === 'coords'" line-type="rows" :line-ids="board.rowIds" />
					<RulerCounts v-else-if="rulerType != null" line-type="rows" :ruler-type="rulerType" :counts="displayCounts[rowKey]" />
				</template>
				<template v-slot:ruler-columns>
					<RulerCoords v-if="rulerType === 'coords'" line-type="columns" :line-ids="board.columnIds" />
					<RulerCounts v-else-if="rulerType != null" line-type="columns" :ruler-type="rulerType" :counts="displayCounts[columnKey]" />
				</template>
			</GameBoard>
		</GameBoardWrapper>
		
		<PuzzleControls
			:can-undo="canUndo"
			:paused="paused"
			@undo="undo"
			@restart="restart"
		/>

		<router-view v-slot="{ Component }">
			<!-- TODO: use FullScreenOverlayPage component -->
			<OverlayPageTransition>
				<div v-if="Component" class="fixed inset-0 bg-gray-50 overflow-y-auto pb-8 z-40">
					<component :is="Component" />
				</div>
			</OverlayPageTransition>
		</router-view>

		<teleport to="#overlay-container">
			<!-- <transition name="finished-modal" :duration="1300"> -->
			<PuzzleFinishedModal v-show="finished && !$store.state.stats.modalHidden" @exit-game="exitGame" />
			<!-- </transition> -->
		</teleport>
	</div>
</template>

<script>
import store from '@/store';
import { mapGetters, mapState } from 'vuex';

import GameBoard from '@/components/gameboard/GameBoard';
import GameBoardHeader from '@/components/gameboard/GameBoardHeader';
import GameBoardWrapper from '@/components/gameboard/GameBoardWrapper';
import PuzzleControls from '@/components/gameboard/PuzzleControls.vue';
import PuzzleInfo from '@/components/gameboard/PuzzleInfo.vue';
import RulerCoords from '@/components/gameboard/RulerCoords';
import RulerCounts from '@/components/gameboard/RulerCounts';
import OverlayPageTransition from '@/views/transitions/OverlayPageTransition.vue';
import PuzzleFinishedModal from '@/components/gameboard/PuzzleFinishedModal.vue';

import { hasCurrentSavedGame } from '@/services/save-game';
import { usePageVisibility } from '@/composables/use-page-visibility';

import { COLUMN, ROW } from '@/lib/constants';
import debounce from 'lodash.debounce';

export default {
	components: {
		GameBoard,
		GameBoardHeader,
		GameBoardWrapper,
		PuzzleControls,
		PuzzleInfo,
		RulerCoords,
		RulerCounts,
		OverlayPageTransition,
		PuzzleFinishedModal,
	},
	setup() {
		const { hidden } = usePageVisibility();
		return { windowHidden: hidden };
	},
	data() {
		return {
			finishedTimeout: null,
			autoSaveInterval: null,
			
			rowKey: ROW,
			columnKey: COLUMN,

			dropdownOpen: false,
			settingsOpen: false,
		}
	},
	computed: {
		...mapState('puzzle', [
			'board', 'initialBoard',
			'difficulty',
			'initialized', 'started', 'paused', 'finished',
		]),
		...mapState('puzzle', {
			rows: state => state.height,
			columns: state => state.width,
		}),
		...mapGetters('puzzle', [			
			'currentCounts', 'remainingCounts',
		]),
		...mapState('settings', [
			'showLineInfo',
		]),
		...mapGetters('settings', [
			'showBoardCoordinates', 'showBoardLineCounts',
		]),
		displayCounts() {
			if (this.rulerType === 'count-remaining') return this.remainingCounts;
			if (this.rulerType === 'count-current') return this.currentCounts;
			return {};
		},
		rulerSize() {
			if (this.showBoardCoordinates) {
				return '16px';
			} else if (this.showBoardLineCounts) {
				return 'cellSize';
			} else return '0px';
		},
		rulerType() {
			if (this.showBoardCoordinates) return 'coords';
			if (this.showLineInfo === 'remainingCount') return 'count-remaining';
			if (this.showLineInfo === 'currentCount') return 'count-current';
			return null;
		},
		progress() {
			const base = this.$store.getters['puzzle/progress'];
			const rounded = Math.ceil(base * 100);
			// prevent progress from being 100 when not every cell is filled
			if (rounded == 100 && base < 1) return 99;
			return rounded;
		},
		canUndo() {
			return this.$store.getters['puzzle/history/canUndo'];
		},
		finishedAndSolved() {
			return this.$store.getters['puzzle/finishedAndSolved'];
		},
		showTimer() {
			return this.$store.state.settings.showTimer;
		},
		boardGrid() {
			return this.board?.grid;
		},
		puzzleShouldBePaused() {
			return this.settingsOpen || this.dropdownOpen || this.windowHidden;
		}
	},
	methods: {
		startGame() {
			if (!this.initialized) {
				console.warn('Cannot start puzzle that is not initialized');
				return;
			}
			if (this.started) {
				console.warn('Cannot start puzzle that is already started!');
				return;
			}
			this.$store.dispatch('puzzle/startPuzzle');
		},
		exitGame() {
			if (this.canSaveGame()) {
				this.saveGame();
			}
			const metaFrom = this.$route.meta.prev;
			if (metaFrom == null) {
				this.$router.replace({ name: 'FreePlay' });
			} else {
				this.$router.go(-1);
			}
		},
		settingsToggled(value) {
			this.settingsOpen = value;
		},
		dropdownToggled(value) {
			this.dropdownOpen = value;
		},
		async finishGame() {
			// window.alert('Good job! You finished this puzzle.');
			const historyEntry = await this.$store.dispatch('puzzle/finishPuzzle');
			await this.$store.dispatch('stats/getGameEndStats', historyEntry);
		},
		undo() {
			this.$store.dispatch('puzzle/undoLastMove');
		},
		restart() {
			this.$store.dispatch('puzzle/restartPuzzle');
		},
		canSaveGame() {
			return this.initialized && this.started && !this.finished && !!this.boardGrid;
		},
		saveGame() {
			if (this.canSaveGame()) {
				this.$store.dispatch('puzzle/savePuzzle');
			}
		},
		initAutoSave() {
			// console.log('init auto save');
			this.autoSaveInterval = setInterval(() => {
				this.saveGame();
			}, 1500);
		},
		stopAutoSave() {
			// console.log('stop auto save');
			clearInterval(this.autoSaveInterval);
			this.autoSaveInterval = null;
		},
	},
	created() {
		this.debouncedPause = debounce((value) => {
			this.$store.dispatch('puzzle/pauseGame', value);
		}, 150);
	},
	mounted() {
		this.startGame();
		this.initAutoSave();
	},
	beforeMount() {
		if (!this.$store.state.puzzle.initialized) {
			if (hasCurrentSavedGame()) {
				this.$store.dispatch('puzzle/loadSavedPuzzle');
				return;
			}
			console.warn('No puzzle in store. Redirecting from PlayPuzzle to Create game route');
			this.$router.replace({ name: 'FreePlay' });
		}
	},
	beforeRouteEnter(to, from, next) {
		if (!store.state.puzzle.initialized) {
			if (hasCurrentSavedGame()) {
				store.dispatch('puzzle/loadSavedPuzzle');
				return next();
			}
			console.warn('No puzzle in store. Redirecting from PlayPuzzle to Create game route');
			return next({ name: 'FreePlay', replace: true });
		}
		next();
	},
	beforeRouteLeave(to, from, next) {
		const toName = to.name;
		const prevName = from.meta?.prev?.name;
		if (toName === prevName && toName === 'MainMenu') {
			return next({ name: 'FreePlay' });
		}
		next();
	},
	beforeRouteUpdate(to, from) {
		if (to.name.includes('settings')) this.settingsOpen = true;
		else this.settingsOpen = false;
	},
	beforeUnmount() {
		if (this.canSaveGame()) {
			this.saveGame();
		}
		this.stopAutoSave();
	},
	unmounted() {
		this.$store.dispatch('puzzle/reset');
	},
	watch: {
		finishedAndSolved: {
			handler(newValue, prevValue) {
				if (newValue) {
					this.finishedTimeout = setTimeout(() => {
						this.finishGame();
					}, 600);
				} else if (prevValue && !newValue) {
					// no longer correct
					clearTimeout(this.finishedTimeout);
					this.finishedTimeout = null;
				}
			}
		},
		puzzleShouldBePaused(newValue, prevValue) {
			setTimeout(() => {
				if (newValue && !prevValue) {
					// immediately pause
					this.debouncedPause(true);
					this.debouncedPause.flush();
				} else if (!newValue && prevValue) {
					// but have a small delay when resuming
					this.debouncedPause(false);
				}
			}, 1000 / 30);
		},
	}
};
</script>

<style lang="postcss" scoped>
.play-puzzle {
	--bg-a: theme(colors.bluegray.50);
	--bg-b: theme(colors.white);
	background: linear-gradient(180deg, var(--bg-a) 0%, var(--bg-a) 15%, var(--bg-b) 90%, var(--bg-b) 100%);
}

.inset-0 {
	max-height: var(--vh-total);
}

.old-board {
	display: inline-grid;
	font-size: var(--cell-font-size);
	gap: var(--grid-gap);

	grid-template-rows: var(--line-helper-size) repeat(var(--board-rows), 1fr) 0px;
	grid-template-columns: var(--line-helper-size) repeat(var(--board-cols), 1fr) 0px;
}
</style>