<template>
	<div class="fixed box-border overflow-auto inset-0 flex flex-col z-20 text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white">

		<GameBoardHeader
			class="flex-shrink-0"
			@cycle-size="cycleFakeSize"
			:rows="rows"
			:columns="columns"	
		/>
		
		<!-- <div class="main justify-center relative">
			<span class="main-board-wrapper mx-auto py-2">
				<GameBoard
					v-if="board"
					:rows="rows"
					:columns="columns"
					:headerHeight="'80px'"
					:controlsHeight="'112px'"
					:rulerSize="'16px'"
				>
					<div
						class="puzzle-info"
					>
						<div>Easy</div>
						<div>Hints: 2</div>
						<div>1:45</div>
					</div>
				</GameBoard>
			</span>
		</div> -->
			<GameBoardWrapper
				:ruler-height="'16px'"
				:ruler-width="'16px'"
				:info-height="'21px'"
				:rows="rows"
				:columns="columns"
				v-slot="{width, height}"
			>
				<GameBoard
					v-if="board"
					:rows="rows"
					:columns="columns"
					:ruler-size="'16px'"
					:grid-height="height"
					:grid-width="width"
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
		<div class="flex-none my-footer bg-none dark:bg-gray-800 dark:bg-opacity-30 text-gray-900 text-opacity-80 text-sm px-8 py-2 dark:text-opacity-80 dark:text-white border-t border-gray-200 dark:border-gray-800 text-center h-28">
			Controls are here!
		</div>
	</div>
</template>

<script>
import store from '@/store';

import PlayGameHeader from '@/components/play-game/PlayGameHeader.vue';
import OldGameBoardWrapper from '@/components/board/GameBoardWrapper';
import OldGameBoard from '@/components/board/GameBoard';

import GameBoard from '@/components/gameboard/GameBoard';
import GameBoardHeader from '@/components/gameboard/GameBoardHeader';
import GameBoardWrapper from '@/components/gameboard/GameBoardWrapper';

export default {
	components: {
		PlayGameHeader,
		OldGameBoardWrapper,
		OldGameBoard,

		GameBoard,
		GameBoardHeader,
		GameBoardWrapper,
	},
	data() {
		return {
			cells: [],
			sizes: [[6, 10], [9, 9], [14, 14], [6, 6], [10, 16]],
			currentFakeSizeIdx: null,
			fakeRows: null,
			fakeColumns: null,
		}
	},
	computed: {
		rows() {
			return this.fakeRows ?? this.$store.state.puzzle.height;
		},
		columns() {
			return this.fakeColumns ?? this.$store.state.puzzle.width;
		},
		board() {
			return this.$store.state.puzzle.board;
		},
		boardGrid() {
			return this.board.grid;
		}
	},
	methods: {
		exitGame() {
			console.log('Should close puzzle');
		},
		openSettings() {
			console.log('Should open settings');
		},
		finishGame() {
			console.log('Should finish game');
		},
		cycleFakeSize() {
			if (this.currentFakeSizeIdx == null) {
				this.currentFakeSizeIdx = 0;
			} else {
				this.currentFakeSizeIdx += 1;
			}
			if (this.currentFakeSizeIdx >= this.sizes.length) {
				this.currentFakeSizeIdx = 0;
			}
			this.fakeSize = this.sizes[this.currentFakeSizeIdx];
			const [columns, rows] = this.fakeSize;
			this.fakeColumns = columns;
			this.fakeRows = rows;
		}
	},
	beforeRouteEnter(to, from, next) {
		if (!store.state.puzzle.initialized) {
			console.log(store.state.puzzle);
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
	watch: {
		boardGrid: {
			handler() {
				this.cells = [...this.board.cells()].map(({x, y, value}, idx) => {
					return {
						x, y, 
						value,
						idx
					};
				});
			},
			deep: true,
			immediate: true
		}
	}
};
</script>

<style lang="postcss" scoped>
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