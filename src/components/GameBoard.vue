<template>
	<div class="fixed overflow-hidden inset-0 flex flex-col bg-truegray-900">
		<div class="header">
			<button @click="$emit('close')">Back</button>
			<h1>Play game</h1>
		</div>
		<div class="board-wrapper" ref="boardWrapper">
			<div
				class="board"
				:style="{'--rows': rows, '--columns': columns, '--cell-size': cellSize }"
			>
				<div
					class="cell-wrapper"
					v-for="n in numCells"
					:key="n"
				>
					<div class="cell"></div>
				</div>
			</div>
		</div>
		<div class="footer">

		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			boardWrapperSize: {
				width: null,
				height: null,
			},
			resizeObserver: null
		}
	},
	computed: {
		rows() {
			return this.$store.state.game.height;
		},
		columns() {
			return this.$store.state.game.width;
		},
		maxCellWidth() {
			if (this.boardWrapperSize.width == null) return 1;
			return Math.floor((this.boardWrapperSize.width - this.columns) / this.columns);
		},
		maxCellHeight() {
			if (this.boardWrapperSize.height == null) return 1;
			return Math.floor((this.boardWrapperSize.height - this.rows) / this.rows);
		},
		cellSize() {
			const max = Math.min(this.maxCellWidth, this.maxCellHeight);
			return Math.floor(max / 2) * 2; // increments of 2
		},
		numCells() {
			return this.rows * this.columns;
		}
	},
	methods: {
		createResizeObserver() {
			// TODO: throttle
			if (this.resizeObserver != null) {
				console.warn('ResizeObserver already created');
				return;
			}
			const resizeObserver = new ResizeObserver(entries => {
				for (let entry of entries) {
					const {width, height} = entry.contentRect;
					this.boardWrapperSize = {width, height};
				}
			});
			this.resizeObserver = resizeObserver;
			this.resizeObserver.observe(this.$refs.boardWrapper);
		},
		deleteResizeObserver() {
			console.log('destroying resize observer');
			this.resizeObserver.disconnect();
		}
	},
	mounted() {
		this.createResizeObserver();
	},
	beforeUnmount() {
		this.deleteResizeObserver();
	},
	watch: {
		cellSize(newvalue, oldvalue) {
			console.log('cell size updated', oldvalue, newvalue);
		}
	}
};
</script>

<style lang="postcss" scoped>
.header {
	@apply border border-truegray-400 h-20 flex-none;
}
.board-wrapper {
	@apply flex-1 overflow-hidden flex items-center justify-center;
}
.footer {
	@apply border border-bluegray-600 h-32 flex-none;
}

.board {
	display: inline-grid;
	grid-template-rows: repeat(var(--rows), 1fr);
	grid-template-columns: repeat(var(--columns), 1fr);
}
.cell-wrapper {
	border-radius: 3px;
	--size: max(calc(var(--cell-size) * 1px), 20px);
	width: var(--size);
	height: var(--size);
	padding: 1px;
}

.cell {
	background: white;
	height: 100%;
	width: 100%;
}
</style>