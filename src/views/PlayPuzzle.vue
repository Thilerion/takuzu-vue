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
				v-if="board"
				:rows="rows"
				:columns="columns"
				:board="board"
				:initial-board="initialBoard"
				:ruler-size="'16px'"
				:grid-height="height"
				:grid-width="width"
				:cell-size="cellSize"
			>
				<div
					class="puzzle-info"
				>
					<div>Easy</div>
					<div>Hints: 2</div>
					<div>1:45</div>
				</div>
			</GameBoard>
		</GameBoardWrapper>
		
		<PuzzleControls
		/>
	</div>
</template>

<script>
import store from '@/store';

import GameBoard from '@/components/gameboard/GameBoard';
import GameBoardHeader from '@/components/gameboard/GameBoardHeader';
import GameBoardWrapper from '@/components/gameboard/GameBoardWrapper';
import PuzzleControls from '@/components/gameboard/PuzzleControls.vue';

export default {
	components: {
		GameBoard,
		GameBoardHeader,
		GameBoardWrapper,
		PuzzleControls,
	},
	data() {
		return {
		}
	},
	computed: {
		rows() {
			return this.$store.state.puzzle.height;
		},
		columns() {
			return this.$store.state.puzzle.width;
		},
		board() {
			return this.$store.state.puzzle.board;
		},
		boardGrid() {
			return this.board.grid;
		},
		initialBoard() {
			return this.$store.state.puzzle.initialBoard;
		}
	},
	methods: {
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
	beforeRouteEnter(to, from, next) {
		if (!store.state.puzzle.initialized) {
			// TODO: check for saved game!
			console.log('Should check for saved game now...');
			console.warn('Game not initialized... Redirecting to New Game.');
			return next({ name: 'FreePlay', replace: true});
		}
		if (from.name === 'FreePlay') {
			to.meta.from = 'FreePlay';
		} else {
			to.meta.from = null;
		}
		next();
	},
	beforeRouteLeave(to, from, next) {
		// TODO: save game! pause game if going to settings!
		console.warn('Should save game first probably');
		next();
	},
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

.puzzle-info {
	@apply px-1 pb-1 text-xs flex flex-1 items-end text-gray-500 dark:text-gray-400 font-medium tracking-wider border-b border-gray-400 dark:border-gray-300 border-opacity-20 dark:border-opacity-10;
	min-width: 220px;
}
.puzzle-info > *:nth-child(2) {
	@apply flex-1 text-center;
}

.old-board {
	display: inline-grid;
	font-size: var(--cell-font-size);
	gap: var(--grid-gap);

	grid-template-rows: var(--line-helper-size) repeat(var(--board-rows), 1fr) 0px;
	grid-template-columns: var(--line-helper-size) repeat(var(--board-cols), 1fr) 0px;
}
</style>