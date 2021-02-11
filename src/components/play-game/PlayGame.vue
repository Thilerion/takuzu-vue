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
			<GameBoardWrapper
				v-if="board"
			>
				<GameBoard
					:rows="rows"
					:columns="columns"
					:cells="cells"
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
				<div v-if="Component" class="fixed inset-0 bg-gray-50 overflow-y-auto pb-8">
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

import { EMPTY } from '../../lib/constants';

import WakeLock from '../../services/wake-lock';
const wakeLock = new WakeLock();

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
		}
	},
	methods: {
		exitGame() {
			this.$emit('close');
		},
		openSettings() {
			this.$router.push({ path: '/play/settings' });
		},
		enableWakeLock() {
			this.wakeLock.enable();
		}
	},
	beforeMount() {
		if (this.shouldEnableWakeLock) {
			this.enableWakeLock();
			this.wakeLock.onChange = (isEnabled) => this.wakeLockEnabled = !!isEnabled;
		}

		if (process.env.NODE_ENV === 'development') {
			const getBoardString = () => this.board.toBoardString();
			const getInitialBoardString = () => this.$store.state.game.initialBoard.toBoardString();
			window._getBoardStr = getBoardString;
			window._getInitBoardStr = getInitialBoardString;
			console.log('enabled board string methods on window object.');
		}
	},
	unmounted() {
		this.wakeLock.destroy();
	},
	watch: {
		board: {
			handler() {
				this.$store.dispatch('saveGame');
			},
			deep: true,
			immediate: true
		}
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