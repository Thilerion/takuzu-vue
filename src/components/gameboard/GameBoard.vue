<template>
	<div class="board new-board" :style="cssVars">
		<div class="cell" v-for="n in rows * columns" :key="n">{{n}}</div>
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

	--grid-max-h: calc(98vh - var(--unavail-height));
	--grid-max-w: calc(99vw - 0.5rem);

	--cell-max-h: calc(var(--grid-max-h) / var(--rows));
	--cell-max-w: calc(var(--grid-max-w) / var(--columns));
}
.board {
	@apply grid relative overflow-hidden;
	grid-template-rows: repeat(var(--rows), 1fr);
	grid-template-columns: repeat(var(--columns), 1fr);
	gap: 2px;
	max-width: 90vw;
	max-height: calc(98vh - var(--unavail-height));
	aspect-ratio: calc(var(--rows) / var(--columns));
}

.new-board .cell {
	@apply bg-blue-300 text-xs overflow-hidden;
	aspect-ratio: 1;
	max-height: 100px;
	min-height: 20px;
}
</style>