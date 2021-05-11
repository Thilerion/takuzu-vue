<template>
	<div class="board new-board relative" :style="cssVars">
		<Ruler
			line-type="columns"
			:amount="columns"
		/>
		<Ruler
			line-type="rows"
			:amount="rows"
		/>
		<div class="cell" v-for="n in rows * columns" :key="n">
			<div class="inner-celll">{{n}}</div>
		</div>
	</div>
</template>

<script>
import Ruler from './Ruler';

export default {
	components: {
		Ruler,
	},
	props: {
		rows: Number,
		columns: Number,
		headerHeight: {
			type: String,
			default: '64px'
		},
		controlsHeight: {
			type: String,
			default: '96px'
		},
		rulerSize: {
			type: String,
			default: '0px'
		},
	},
	computed: {
		cssVars() {
			return {
				'--rows': this.rows,
				'--columns': this.columns,
				'--header-height': this.headerHeight,
				'--controls-height': this.controlsHeight,
				'--ruler-size': this.rulerSize,
			}
		}
	}
};
</script>

<style lang="postcss" scoped>
.board {

	--unavail-height: calc(var(--header-height) + var(--controls-height) + var(--ruler-size));
	--unavail-width: calc(var(--ruler-size));

	--vh98: calc(var(--vh-total) * 0.98);

	--grid-max-h: calc(var(--vh98) - var(--unavail-height));
	--grid-max-w: calc(99vw - 0.5rem - var(--unavail-width));

	--cell-max-h: calc(var(--grid-max-h) / var(--rows));
	--cell-max-w: calc(var(--grid-max-w) / var(--columns));

	--cell-padding: 2px;
}
.board {
	@apply grid relative mx-auto;
	grid-template-rows: var(--ruler-size) repeat(var(--rows), 1fr);
	grid-template-columns: var(--ruler-size) repeat(var(--columns), 1fr);
	/* gap: 2px; */
	max-width: var(--grid-max-w);
	max-height: var(--grid-max-h);
	aspect-ratio: calc(var(--columns) / var(--rows));
}

.new-board .cell {
	@apply bg-blue-300 text-xs overflow-hidden flex justify-center items-center bg-opacity-0;	
	aspect-ratio: 1;
	min-height: 20px;
	min-width: 20px;
	width: 100%;
	height: 100%;
}

.inner-celll {
	@apply bg-teal-200 m-auto overflow-hidden;
	width: calc(100% - var(--cell-padding) * 2);
	height: calc(100% - var(--cell-padding) * 2);
}
</style>