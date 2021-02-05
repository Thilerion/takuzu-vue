<template>
	<div class="cell">
		<div class="cell-color" :class="[displayValue]" v-if="theme === 'colored'"></div>
		<span class="cell-value" v-else>{{displayValue}}</span>
	</div>
</template>

<script>
import { ONE, ZERO } from '@/lib/constants';
const displayValues = {
	binary: {
		[ONE]: '1',
		[ZERO]: '0'
	},
	tictactoe: {
		[ONE]: 'X',
		[ZERO]: 'O'
	},
	colored: {
		[ONE]: 'one',
		[ZERO]: 'zero'
	}
}

export default {
	props: {
		value: {
			type: String,
			default: null
		},
		theme: {
			type: String,
			default: 'binary'
		}
	},
	computed: {
		displayValue() {
			if (this.value == null) return;
			return displayValues[this.theme][this.value];
		},
	},
};
</script>

<style lang="postcss" scoped>
.cell-value {
	@apply m-auto inline-block text-gray-700;
	font-size: var(--cell-font-size);
	line-height: calc(var(--size) * 1.1);

	--red-a: #6F1D19;
	--red-b: #78221C;
	--red-c: #82261E;
	--red-d: #8B2B21;

	--blue-a: #1B417A;
	--blue-b: #1E4C84;
	--blue-c: #21578E;
	--blue-d: #246398;
}

.cell-theme-01 .cell-value {
	@apply font-number;
}
.cell-theme-OX .cell-value {
	@apply font-sans font-bold;
}

.cell-color {
	@apply w-full h-full;
}

.cell-color.one {
	@apply dark:bg-one-dark bg-one-primary;
}
.cell-color.zero {
	@apply dark:bg-zero-dark bg-zero-primary;
}
</style>