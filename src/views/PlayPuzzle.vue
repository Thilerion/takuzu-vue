<template>
	<div class="fixed overflow-hidden inset-0 flex flex-col z-20 text-gray-900 bg-white">
		<header class="bg-gray-50 flex justify-between items-center h-16 border-b px-1 flex-shrink-0">
			<IconBtn>close</IconBtn>
			<button @click="cycleFakeSize" class="font-medium tracking-widest text-xl">{{columns}}x{{rows}}</button>
			<IconBtn>more_vert</IconBtn>
		</header>
		
		<div class="main">
			<div class="main-board-wrapper flex-1 h-full">
				<GameBoard
					v-if="board"
					:rows="rows"
					:columns="columns"
				/>
			</div>
			
			<!-- <OldGameBoardWrapper
				v-if="board"
				:board="board"
			>
				<OldGameBoard
					:rows="rows"
					:columns="columns"
					:cells="cells"
					@finish-game="finishGame"
				/>
				<PlayGameCheckIndicator />
			</OldGameBoardWrapper> -->
		</div>
		<div class="flex-shrink-0 my-footer bg-gray-50 border-t text-center h-24">
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

export default {
	components: {
		PlayGameHeader,
		OldGameBoardWrapper,
		OldGameBoard,

		GameBoard,
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
.header {
	@apply flex-none h-16;
}
.main {
	@apply flex-1 flex flex-col;
}

.old-board {
	display: inline-grid;
	font-size: var(--cell-font-size);
	gap: var(--grid-gap);

	grid-template-rows: var(--line-helper-size) repeat(var(--board-rows), 1fr) 0px;
	grid-template-columns: var(--line-helper-size) repeat(var(--board-cols), 1fr) 0px;
}
</style>