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
		msToMinSec(ms) {
			const format = val => `0${Math.floor(val)}`.slice(-2);

			const fullSeconds = Math.floor(ms / 1000);

			const minutes = fullSeconds / 60;
			const seconds = fullSeconds % 60;
			return `${format(minutes)}:${format(seconds)}`;
		},
		saveGameWithTime() {
			if (!this.board) {
				return;
			}
			const elapsed = this.timer?.getCurrentElapsed() ?? 0;
			this.$store.commit('setUnmountTimeElapsed', elapsed);
			this.$store.dispatch('saveGame');
		},
		finishGame() {
			const elapsed = this.timer?.getCurrentElapsed() ?? 0;
			this.$store.commit('setUnmountTimeElapsed', elapsed);
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