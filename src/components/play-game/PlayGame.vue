<template>
	<div class="fixed overflow-hidden inset-0 flex flex-col z-20 text-gray-900 bg-gray-50">
		
		<PlayGameHeader
			class="header"
			:rows="rows"
			:columns="columns"
			@close="exitGame"
			@open-settings="openSettings"
		/>
			
		<div class="main">
			<div v-if="showTimer && timer && !!timer.elapsed" class="text-center text-sm opacity-70 -mt-3">{{msToMinSec(timer.elapsed)}}</div>
			<GameBoardWrapper
				v-if="board"
			>
				<GameBoard
					:rows="rows"
					:columns="columns"
					:cells="cells"
					@finish-game="finishGame"
				/>
				<PlayGameCheckIndicator />
			</GameBoardWrapper>
		</div>

		<div class="footer">
			<PlayGameControls />
			<PlayGameHints />
		</div>

		<!-- SETTINGS OVERLAY NESTED VIEW: -->
		<router-view v-slot="{ Component }">
			<!-- TODO: use FullScreenOverlayPage component -->
			<OverlayPageTransition>
				<div v-if="Component" class="fixed inset-0 bg-gray-50 overflow-y-auto pb-8 z-40">
					<component :is="Component" />
				</div>
			</OverlayPageTransition>
		</router-view>
	</div>
</template>

<script>
import GameBoardWrapper from '../board/GameBoardWrapper';
import GameBoard from '../board/GameBoard';

import OverlayPageTransition from '@/views/transitions/OverlayPageTransition.vue';

import PlayGameHeader from './PlayGameHeader';
import PlayGameControls from './PlayGameControls';
import PlayGameCheckIndicator from './PlayGameCheckIndicator';
import PlayGameHints from './PlayGameHints';

import WakeLock from '../../services/wake-lock';
const wakeLock = new WakeLock();

import Timer from '../../services/timer';

import {usePageVisibility} from '@/composables/use-page-visibility';
import { getGameEndStats } from '@/services/stats';
import { timeFormatter } from '@/utils/date.utils';
const {visibility, hidden} = usePageVisibility();

export default {
	components: {
		GameBoardWrapper,
		GameBoard,
		OverlayPageTransition,
		PlayGameHeader,
		PlayGameControls,
		PlayGameCheckIndicator,
		PlayGameHints,
	},
	emits: ['close'],
	data() {
		return {
			wakeLock,
			wakeLockEnabled: false,
			
			timer: null,
			storeSubscription: null,
		}
	},
	computed: {
		board() {
			return this.$store.state.game.board;
		},
		cells() {
			return [...this.board.cells()].map(({x, y, value}, idx) => {
				return {
					x, y, 
					value,
					idx
				};
			});
		},
		rows() {
			return this.$store.state.game.height;
		},
		columns() {
			return this.$store.state.game.width;
		},
		shouldEnableWakeLock() {
			return this.$store.state.settings.enableWakeLock;
		},
		canSaveGame() {
			return this.$store.getters.canSave;
		},
		isSettingsOpen() {
			const route = this.$route || { path: '' };
			return route.path.endsWith('settings');
		},
		isBoardVisible() {
			return !!this.board && !this.isSettingsOpen && !hidden.value;
		},
		showTimer() {
			return this.$store.state.settings.showTimer;
		},
	},
	methods: {
		exitGame() {
			this.saveGameWithTime();
			this.$emit('close');
		},
		openSettings() {
			this.$router.push({ path: '/play/settings' });
		},
		enableWakeLock() {
			this.wakeLock.enable();
		},
		initPlayTimer() {
			if (this.timer && this.timer.reset) {
				console.log('Init timer; already exists; resetting.');
				this.timer.reset();
			} else if (!this.timer) {
				const elapsed = this.$store.state.game.timeElapsedOnLoad ?? 0;
				this.timer = new Timer(elapsed);
			}
		},
		startPlayTimer() {
			if (!this.timer) {
				console.warn('No timer object initialized!');
				return;
			}
			this.timer.start();			
		},
		pausePlayTimer() {
			this.timer.pause();
		},
		stopPlayTimer() {
			this.pausePlayTimer();
		},
		resetPlayTimer() {
			this.timer.reset();
		},
		msToMinSec: timeFormatter({ padMinutes: true }),
		saveGameWithTime() {
			if (!this.board) {
				return;
			}
			const elapsed = this.timer?.getCurrentElapsed() ?? 0;
			this.$store.commit('setUnmountTimeElapsed', elapsed);
			this.$store.dispatch('saveGame');
		},
		finishGame() {
			// const elapsed = this.timer?.getCurrentElapsed() ?? 0;
			// this.$store.commit('setUnmountTimeElapsed', elapsed);
			// this.$store.dispatch('finishGame');
			this.handleGameEnd();
		},
		async handleGameEnd() {
			const time = this.timer?.getCurrentElapsed() ?? 0;
			this.$store.commit('setUnmountTimeElapsed', time);

			const { width, height, difficulty } = this.$store.state.game;
			
			const gameEndStats = await getGameEndStats({width, height, difficulty});
			let {
				count: previousCount = 0, 
				average: previousAverage,
				best: previousBest
			} = gameEndStats;

			if (previousCount === 0) {
				// high score because first puzzle solved @ size+difficulty
				let str = `Nice! You've solved your first puzzle @ ${width}x${height} with ${difficulty} stars!\n\n`;
				str += `Time: ${this.msToMinSec(time)}`;
				window.alert(str);
			} else if (time < previousBest) {
				// high score
				const newCount = previousCount + 1;
				const newAverage = ((previousAverage * previousCount) + time) / newCount;
				const highScoreImprovement = Math.round((previousBest - time) / 10) / 100;
				let str = `Wow! You've set a new high score!\n\n`;
				str += `Puzzles solved: ${newCount} @ ${width}x${height} - ${difficulty}*\n`;
				str += `Time: ${this.msToMinSec(time)}, previous best: ${this.msToMinSec(previousBest)}, average: ${this.msToMinSec(newAverage)}\n\n`;
				str += `You've improved your high score by ${highScoreImprovement}s!`;
				window.alert(str);
			} else if (time < previousAverage) {
				// not a high score, but faster than average
				const newCount = previousCount + 1;
				const newAverage = ((previousAverage * previousCount) + time) / newCount;
				const fasterThanAverage = Math.round((previousAverage - time) / 10) / 100;

				let str = `Nice! You were ${fasterThanAverage}s faster than your previous average!\n\n`;
				str += `Puzzles solved: ${newCount} @ ${width}x${height} - ${difficulty}*\n`;
				str += `Time: ${this.msToMinSec(time)}, best: ${this.msToMinSec(previousBest)}, average: ${this.msToMinSec(newAverage)}`;
				window.alert(str);
			} else {
				// no improvement
				const newCount = previousCount + 1;
				const newAverage = ((previousAverage * previousCount) + time) / newCount;
				
				let str = `Good job!\n\n`;
				str += `Puzzles solved: ${newCount} @ ${width}x${height} - ${difficulty}*\n`;
				str += `Time: ${this.msToMinSec(time)}, best: ${this.msToMinSec(previousBest)}, average: ${this.msToMinSec(newAverage)}`;
				window.alert(str);
			}
			
			this.$store.dispatch('finishGame');
		}
	},
	beforeMount() {
		if (this.shouldEnableWakeLock) {
			this.enableWakeLock();
			this.wakeLock.onChange = (isEnabled) => this.wakeLockEnabled = !!isEnabled;
		}

		this.storeSubscription = this.$store.subscribeAction((action) => {
			if (action.type === 'restartPuzzle') {
				this.resetPlayTimer();
			}
		})
	},
	unmounted() {
		this.stopPlayTimer();
		this.saveGameWithTime();
		this.wakeLock.destroy();
		this.storeSubscription();
	},
	watch: {
		board: {
			handler(val) {
				if (!val) return;
				this.saveGameWithTime();
			},
			deep: true,
			immediate: true
		},
		isBoardVisible: {
			handler(newValue) {
				if (this.timer == null) {
					this.initPlayTimer();
				}

				if (!!newValue) {
					this.startPlayTimer();
				} else if (!newValue) {
					this.pausePlayTimer();
					this.saveGameWithTime();
				}
			},
			immediate: true
		},
	}
};
</script>

<style lang="postcss" scoped>
.header {
	@apply flex-none h-16;
}
.main {
	@apply flex-1 flex flex-col;
}
.footer {
	@apply flex-none h-32 flex px-6 relative items-center justify-center text-gray-700;
}

.board {
	display: inline-grid;
	font-size: var(--cell-font-size);
	gap: var(--grid-gap);

	grid-template-rows: var(--line-helper-size) repeat(var(--board-rows), 1fr) 0px;
	grid-template-columns: var(--line-helper-size) repeat(var(--board-cols), 1fr) 0px;
}
</style>