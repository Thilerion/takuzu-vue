<template>
	<div class="gameboard-view fixed overflow-hidden inset-0 flex flex-col z-20">
		<PageHeader>
			{{columns}}x{{rows}}
		</PageHeader>
		<div class="board-wrapper font-number" ref="boardWrapper">
			<div
				class="board"
				:style="{'--rows': rows, '--columns': columns, '--cell-size': cellSize, '--gap': gap, '--cell-font-size': cellFontSize }"
			>
				<GameBoardCell
					v-for="cell in cells"
					:key="cell.idx"
					:value="cell.value"
				/>
			</div>
		</div>
		<div class="footer">

		</div>
	</div>
</template>

<script>
import throttle from 'lodash.throttle';

import GameBoardCell from './GameBoardCell';

export default {
	components: {
		GameBoardCell
	},
	data() {
		return {
			boardWrapperSize: {
				width: null,
				height: null,
			},
			resizeObserver: null,
			cellFontSizes: [16, 18, 24, 32, 40, 48]
		}
	},
	computed: {
		cellFontSize() {
			const cellSize = this.cellSize;
			let cellFontSize = this.cellFontSizes[0];

			for (let i = 1; i < this.cellFontSizes.length; i++) {
				if (cellSize - 4 < this.cellFontSizes[i]) {
					break;
				}
				cellFontSize = this.cellFontSizes[i];
			}
			return cellFontSize;
		},
		cells() {
			if (this.rows == null || this.columns == null) return [];
			return Array(this.numCells).fill(null).map((val, idx) => {
				const rnd = Math.random();
				const value = rnd < 0.1 ? '1' : rnd > 0.9 ? '0' : null;
				return {value, idx};
			})
		},
		rows() {
			return this.$store.state.game.height;
		},
		columns() {
			return this.$store.state.game.width;
		},
		maxCellWidth() {
			if (this.boardWrapperSize.width == null) return 1;
			return Math.floor((this.availWidth) / this.columns);
		},
		maxCellHeight() {
			if (this.boardWrapperSize.height == null) return 1;
			return Math.floor((this.availHeight) / this.rows);
		},
		cellSize() {
			const max = Math.min(this.maxCellWidth, this.maxCellHeight);
			return (Math.floor(max / 2) * 2); // increments of 2
		},
		numCells() {
			return this.rows * this.columns;
		},
		gap() {
			return 2;
		},
		totalPaddingWidth() {
			return 5 + (this.gap * this.columns);
		},
		totalPaddingHeight() {
			return 5 + (this.gap * this.rows);
		},
		availWidth() {
			return this.boardWrapperSize.width - this.totalPaddingWidth;
		},
		availHeight() {
			return this.boardWrapperSize.height - this.totalPaddingHeight;
		}
	},
	methods: {
		handleResize(entries) {
			for (let entry of entries) {
				const {width, height} = entry.contentRect;
				this.boardWrapperSize = {width, height};
			}
		},
		createResizeObserver() {
			if (this.resizeObserver != null) {
				console.warn('ResizeObserver already created');
				return;
			}
			const throttledFn = throttle((entries) => {
				this.handleResize(entries);
			}, 250);
			const resizeObserver = new ResizeObserver(throttledFn);
			this.resizeObserver = resizeObserver;
			this.resizeObserver.observe(this.$refs.boardWrapper);
		},
		deleteResizeObserver() {
			console.log('destroying resize observer');
			this.resizeObserver.disconnect();
		}
	},
	mounted() {
		const rect = this.$refs.boardWrapper.getBoundingClientRect();
		this.boardWrapperSize = {
			width: rect.width,
			height: rect.height
		}
		this.createResizeObserver();
	},
	beforeUnmount() {
		this.deleteResizeObserver();
	}
};
</script>

<style lang="postcss" scoped>
.gameboard-view {
	background: inherit;
}

.header {
	@apply h-20 flex-none grid;
}
.board-wrapper {
	@apply flex-1 overflow-hidden flex items-center justify-center;
}
.footer {
	@apply h-32 flex-none;
}

.board {
	display: inline-grid;
	grid-template-rows: repeat(var(--rows), 1fr);
	grid-template-columns: repeat(var(--columns), 1fr);
	gap: calc(var(--gap) * 1px);
	font-size: calc(var(--cell-font-size) * 1px);
}
</style>