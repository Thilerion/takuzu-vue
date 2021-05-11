<template>
	<div class="board new-board" :style="cssVars">
		<div class="cell" v-for="n in rows * columns" :key="n">
			<div class="inner-celll">{{n}}</div>
		</div>
	</div>
</template>

<script>
const CSS_VAR_KEYS = ['rows', 'columns'];
function toCssVarName(name) {
	return `--${name}`;
}

export default {
	props: {
		rows: Number,
		columns: Number,
	},
	computed: {
		cssVars() {
			const result = {};
			for (const key of CSS_VAR_KEYS) {
				result[toCssVarName(key)] = this[key];
			}
			console.log(result);
			return result;
		}
	}
};
</script>

<style lang="postcss" scoped>
.board {
	--header-height: 64px;
	--controls-height: 96px;

	--unavail-height: calc(var(--header-height) + var(--controls-height));

	--vh98: calc(var(--vh-total) * 0.98);

	--grid-max-h: calc(var(--vh98) - var(--unavail-height));
	--grid-max-w: calc(99vw - 0.5rem);

	--cell-max-h: calc(var(--grid-max-h) / var(--rows));
	--cell-max-w: calc(var(--grid-max-w) / var(--columns));
}
.board {
	@apply grid relative overflow-auto mx-auto;
	grid-template-rows: repeat(var(--rows), 1fr);
	grid-template-columns: repeat(var(--columns), 1fr);
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
	width: calc(100% - 5px);
	height: calc(100% - 5px);
}
</style>