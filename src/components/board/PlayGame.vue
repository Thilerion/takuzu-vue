<template>
	<div class="gameboard-view fixed overflow-hidden inset-0 flex flex-col z-20">
		<PageHeader close-btn @close="$emit('close')">
			{{columns}}x{{rows}}
		</PageHeader>
		<GameBoardWrapper
			:rows="rows"
			:columns="columns"
			:gap="gap"
			v-slot="{ cellSize, cellFontSize }"
		>
			<GameBoard
				:cellSize="cellSize"
				:cellFontSize="cellFontSize"
				:rows="rows"
				:columns="columns"
				:gap="gap"
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

export default {
	components: {
		GameBoardWrapper,
		GameBoard,
		IconBtnText
	},
	data() {
		return {
			gap: 2,
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
	grid-template-rows: repeat(var(--rows), 1fr);
	grid-template-columns: repeat(var(--columns), 1fr);
	gap: calc(var(--gap) * 1px);
	font-size: calc(var(--cell-font-size) * 1px);
}

.footer > * {
	@apply mr-2 text-xs flex flex-col justify-start flex-auto;
}
.footer > *:last-child {
	@apply mr-0;
}
</style>