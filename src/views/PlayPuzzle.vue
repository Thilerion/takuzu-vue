<template>
	<div class="play-puzzle fixed box-border overflow-auto inset-0 flex flex-col z-20 text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white">

		<GameBoardHeader
			class="flex-shrink-0"
			@cycle-size="() => {}"
			@close="exitGame"
			:rows="rows"
			:columns="columns"	
		/>
		<GameBoardWrapper
			:ruler-height="'16px'"
			:ruler-width="'16px'"
			:info-height="'21px'"
			:rows="rows"
			:columns="columns"
			v-slot="{width, height, cellSize}"
		>
			<GameBoard
				v-if="started && board"
				:rows="rows"
				:columns="columns"
				:board="board"
				:initial-board="initialBoard"
				:ruler-size="'16px'"
				:grid-height="height"
				:grid-width="width"
				:cell-size="cellSize"
			>
				<template v-slot:puzzle-info>
					<PuzzleInfo
						show-timer
						:difficulty="difficulty"
					/>
				</template>
			</GameBoard>
		</GameBoardWrapper>
		
		<PuzzleControls
		/>
	</div>
</template>

<script>
import store from '@/store';
import { mapState } from 'vuex';

import GameBoard from '@/components/gameboard/GameBoard';
import GameBoardHeader from '@/components/gameboard/GameBoardHeader';
import GameBoardWrapper from '@/components/gameboard/GameBoardWrapper';
import PuzzleControls from '@/components/gameboard/PuzzleControls.vue';
import PuzzleInfo from '@/components/gameboard/PuzzleInfo.vue';

export default {
	components: {
		GameBoard,
		GameBoardHeader,
		GameBoardWrapper,
		PuzzleControls,
		PuzzleInfo,
	},
	data() {
		return {
		}
	},
	computed: {
		...mapState('puzzle', [
			'board', 'initialBoard',
			'difficulty',
			'initialized', 'started', 'paused',
		]),
		...mapState('puzzle', {
			rows: state => state.height,
			columns: state => state.width,
		}),
		boardGrid() {
			return this.board.grid;
		},
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
			console.log('Starting game now.');
			this.$store.dispatch('puzzle/startPuzzle');
		},
		exitGame() {
			const metaFrom = this.$route.from;
			if (metaFrom == null) {
				this.$router.go(-1);
				this.$router.replace({ name: 'FreePlay' });
			} else {
				this.$router.go(-1);
			}
			console.warn('Resetting puzzle store. TODO: save game and more.');
			this.$store.commit('puzzle/reset');
		},
		openSettings() {
			console.log('Should open settings');
		},
		finishGame() {
			console.log('Should finish game');
		},
	},
	mounted() {
		this.startGame();
	},
	beforeRouteEnter(to, from, next) {
		if (!store.state.puzzle.initialized) {
			// TODO: check for saved game
			console.warn('No puzzle in store. Redirecting from PlayPuzzle to Create game route');
			return next({ name: 'FreePlay', replace: true });
		}
		next();
	},
	// beforeRouteEnter(to, from, next) {
	// 	if (!store.state.puzzle.initialized) {
	// 		// TODO: check for saved game!
	// 		console.log('Should check for saved game now...');
	// 		console.warn('Game not initialized... Redirecting to New Game.');
	// 		return next({ name: 'FreePlay', replace: true});
	// 	}
	// 	if (from.name === 'FreePlay') {
	// 		to.meta.from = 'FreePlay';
	// 	} else {
	// 		to.meta.from = null;
	// 	}
	// 	next();
	// },
	// beforeRouteLeave(to, from, next) {
	// 	// TODO: save game! pause game if going to settings!
	// 	console.warn('Should save game first probably');
	// 	next();
	// },
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