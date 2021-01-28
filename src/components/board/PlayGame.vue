<template>
	<div class="gameboard-view fixed overflow-hidden inset-0 flex flex-col z-20">
		<PageHeader close-btn @close="$emit('close')">
			{{columns}}x{{rows}}
		</PageHeader>
		<GameBoardWrapper>
			<GameBoard
				:rows="rows"
				:columns="columns"
				:cells="cells"
			/>
		</GameBoardWrapper>
		<div class="footer flex items-center justify-center text-gray-700">
			<IconBtnText size="26" icon="undo">
				Undo
			</IconBtnText>
			<IconBtnText size="26" icon="replay">
				Restart
			</IconBtnText>
			<IconBtnText size="26" icon="done">
				Check
			</IconBtnText>
			<IconBtnText size="26" icon="emoji_objects">				
				Hint
			</IconBtnText>
			<IconBtnText @click="showSolution" size="26" icon="emoji_objects">				
				Solution
			</IconBtnText>
		</div>
	</div>
</template>

<script>
import GameBoardWrapper from './GameBoardWrapper';
import GameBoard from './GameBoard';

import IconBtnText from '@/components/base-layout/IconBtnText';
import { EMPTY } from '../../lib/constants';
import Solver from '../../lib/solver/Solver';
import { GAP_SIZE } from './config';

export default {
	components: {
		GameBoardWrapper,
		GameBoard,
		IconBtnText
	},
	data() {
		return {
			gap: GAP_SIZE,
			hasBookmark: false
		}
	},
	computed: {
		board() {
			return this.$store.state.game.board;
		},
		grid() {
			return this.board.grid;
		},
		cells() {
			return [...this.board.cells()].map(({x, y, value}, idx) => {
				return {
					x, y, 
					value: value === EMPTY ? null : value,
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
		numCells() {
			return this.rows * this.columns;
		}		
	},
	methods: {
		showSolution() {
			console.log(this.board.copy());
			const config = {
				maxSolutions: 2,
				timeoutDuration: 500,
				throwAfterTimeout: true,
				disableBacktracking: true
			}
			const solutions = Solver.run(this.board.copy(), config);
			console.log({solutions});

			if (solutions.length === 1) {
				this.$store.commit('setBoard', solutions[0].copy());
			} else {
				console.warn('NO SINGLE SOLUTION FOUND');
			}
		}
	}
};
</script>

<style lang="postcss" scoped>
.gameboard-view {
	background: inherit;
}

.header {
	@apply flex-none grid;
}
.footer {
	@apply h-24 flex-none flex px-6;
}

.board {
	display: inline-grid;
	font-size: var(--cell-font-size);
	gap: var(--grid-gap);

	grid-template-rows: var(--line-helper-size) repeat(var(--board-rows), 1fr) 0px;
	grid-template-columns: var(--line-helper-size) repeat(var(--board-cols), 1fr) 0px;
}

.footer > * {
	@apply mr-2 text-xs flex flex-col justify-start flex-auto;
}
.footer > *:last-child {
	@apply mr-0;
}
</style>