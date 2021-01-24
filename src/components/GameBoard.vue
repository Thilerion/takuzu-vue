<template>
	<div class="gameboard-view fixed overflow-hidden inset-0 flex flex-col z-20">
		<div class="header">
			<button @click="$emit('close')">Back</button>
			<h1>{{columns}}x{{rows}}</h1>
		</div>
		<div class="board-wrapper" ref="boardWrapper">
			<div
				class="board"
				:style="{'--rows': rows, '--columns': columns, '--cell-size': cellSize, '--gap': gap }"
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
import throttle from 'lodash.throttle';

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
	@apply border border-truegray-400 h-20 flex-none grid;
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
	gap: calc(var(--gap) * 1px);
}
.cell-wrapper {
	--size: clamp(1.25rem, calc(var(--cell-size) * 1px), 4rem);
	width: var(--size);
	height: var(--size);
}

.cell {
	@apply bg-gray-200 dark:bg-gray-800 rounded-sm h-full w-full;
}
</style>