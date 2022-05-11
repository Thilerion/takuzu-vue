<template>
	<div
		class="cell"
		:class="[{ locked, incorrect }]"
	>
			<template v-if="symbolType === 'binary'">
				<transition name="cell-symbol">
					<div v-if="symbolValue !== '.'" class="number-icon-wrapper">
						<icon-tabler-number-0 class="number-icon text-cyan-700" v-if="symbolValue === '0'" />
						<icon-tabler-number-1 class="number-icon text-gray-600" v-else-if="symbolValue === '1'" />
					</div>
				</transition>
			</template>
			<template v-else-if="symbolType === 'tictactoe'">
				<transition name="cell-symbol">
					<div v-if="symbolValue !== '.'" class="">
						<span class="cell-symbol-value text-cyan-700" v-if="symbolValue === 'O'">O</span>
						<span class="cell-symbol-value text-gray-600" v-else-if="symbolValue === 'X'">X</span>
					</div>
				</transition>
			</template>
	</div>
</template>

<script>
const TicTacToeSymbols = {
	[EMPTY]: '',
	[ZERO]: 'O',
	[ONE]: 'X'
}
const BinarySymbols = {
	[EMPTY]: '',
	[ZERO]: '0',
	[ONE]: '1'
}
</script>

<script setup>
import { EMPTY, ONE, ZERO } from "@/lib/constants.js";
import { isValidPuzzleSymbol } from "@/lib/utils";
import { computed, toRefs, Transition, inject, toRef } from "vue";

const props = defineProps({
	value: {
		validator(val) {
			return isValidPuzzleSymbol(val);
		},
		required: true
	},
	locked: Boolean,
	incorrect: Boolean
})

const { value, locked, incorrect } = toRefs(props);

const cellTheme = inject('cellTheme');
const symbolType = toRef(cellTheme, 'value');

const symbolMap = computed(() => {
	if (symbolType.value === 'binary') return BinarySymbols;
	else if (symbolType.value === 'tictactoe') return TicTacToeSymbols;
	throw new Error(`Unrecognized symbolType (accepts binary and tictactoe): ${symbolType.value}`);
})

const symbolValue = computed(() => symbolMap.value[value.value]);
</script>

<style scoped>
.cell {
	@apply overflow-hidden relative pointer-events-none flex;
	@apply w-full h-full;
	@apply bg-gray-125 text-gray-700 dark:bg-slate-700 dark:text-gray-150;
	/* contain: strict; */
	--base-cell-size: calc(var(--cell-size) - var(--grid-gap));
}
.cell.locked {
	@apply bg-gray-150 dark:bg-slate-800;
}
.cell.incorrect {
	@apply bg-red-400 bg-opacity-20 ring-1 ring-inset ring-red-900 ring-opacity-40;
}
.cell > *, .cell {
	border-radius: var(--cell-rounding);
}

.cell-symbol-enter-active, .cell-symbol-leave-active {
	transition: opacity 0.05s ease .05s;
}
.cell-symbol-enter-from, .cell-symbol-leave-to {
	opacity: 0;
}

.cell-symbol-value {
	@apply m-auto;
}
.cell-symbol-value {
	--font-size: clamp(16px, var(--base-size), 48px);
	/* font-size: var(--font-size); */
	/* line-height: var(--line-height); */
}
.number-icon {
	@apply pointer-events-none w-full h-full m-auto;
	font-size: var(--font-size);
	max-height: 4rem;
	max-width: 4rem;
}

.cell-size-l, .cell-size-xl {
	--icon-pad: 8px;
}
.cell-size-xs {
	--icon-pad: 4px;
}
.number-icon-wrapper {
	@apply relative box-border w-full h-full flex;
	padding: 2px;
}
</style>

<style>
.cell-theme-binary .cell-symbol-value {
	@apply font-number;
	--base-size: calc(var(--base-cell-size) - 4px);
	--line-height: calc(var(--base-size) * 1.25);
}
.cell-theme-tictactoe .cell-symbol-value {
	@apply font-sans;
	--base-size: calc(var(--base-cell-size) - 6px);
	--line-height: calc(var(--base-size) * 1.01);
	font-size: calc(var(--base-size) * 0.9);
}
.cell-theme-tictactoe .cell {
	@apply flex items-center justify-center overflow-hidden;
	--font-size: 48px;
	--base-pad: calc(var(--base-cell-size) / 10);
	padding: clamp(1px, var(--base-pad), 57px);
	width: 100%;
	height: 100%;
}
</style>