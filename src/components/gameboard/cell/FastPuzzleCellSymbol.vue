<template>
	<div
		class="cell"
		:class="[{ locked, incorrect: !!incorrect, highlighted: !!highlighted }]"
	>
			<template v-if="symbolType === CellThemes.CLASSIC">
				<transition name="cell-symbol">
					<div v-if="symbolValue !== ''" class="number-icon-wrapper">
						<icon-tabler-number-0 class="number-icon text-cyan-700 dark:text-cyan-500" v-if="symbolValue === '0'" />
						<icon-tabler-number-1 class="number-icon text-gray-600 dark:text-gray-300" v-else-if="symbolValue === '1'" />
					</div>
				</transition>
			</template>
			<template v-else-if="symbolType === CellThemes.TICTACTOE">
				<transition name="cell-symbol">
					<div v-if="symbolValue !== ''" class="">
						<span class="cell-symbol-value text-cyan-700 dark:text-cyan-500" v-if="symbolValue === 'O'">O</span>
						<span class="cell-symbol-value text-gray-600 dark:text-gray-300" v-else-if="symbolValue === 'X'">X</span>
					</div>
				</transition>
			</template>
	</div>
</template>

<script lang="ts">
const TicTacToeSymbols = {
	[EMPTY]: '',
	[ZERO]: 'O',
	[ONE]: 'X'
} as const satisfies Record<PuzzleValue, string>;
const BinarySymbols = {
	[EMPTY]: '',
	[ZERO]: '0',
	[ONE]: '1'
} as const satisfies Record<PuzzleValue, string>;
</script>

<script setup lang="ts">
import { EMPTY, ONE, ZERO, type PuzzleValue } from "@/lib/constants";
import { CellThemes } from "@/stores/settings/options";
import { computed, toRefs } from "vue";
import { useCellThemeProvider } from "../composables/useCellThemeProvider.js";

const props = defineProps<{
	value: PuzzleValue,
	locked: boolean,
	incorrect: boolean | undefined,
	highlighted?: boolean
}>()

const { value, locked, incorrect } = toRefs(props);

const { cellTheme: symbolType } = useCellThemeProvider();

const symbolMap = computed(() => {
	if (symbolType.value === CellThemes.CLASSIC) return BinarySymbols;
	else if (symbolType.value === CellThemes.TICTACTOE) return TicTacToeSymbols;
	throw new Error(`Unrecognized symbolType (accepts binary and tictactoe): ${symbolType.value}`);
})

const symbolValue = computed(() => symbolMap.value[value.value]);
</script>

<style scoped>
.cell {
	@apply overflow-hidden relative pointer-events-none flex;
	@apply w-full h-full;
	@apply bg-gray-125 text-gray-700 dark:bg-slate-800 dark:text-gray-150;
	/* contain: strict; */
	--base-cell-size: calc(var(--cell-size) - var(--grid-gap));
}
.cell.locked {
	@apply bg-gray-150 dark:bg-slate-775;
}
.cell.incorrect {
	@apply bg-red-400 bg-opacity-20 ring-1 ring-inset ring-red-900 ring-opacity-40;
}
.cell.highlighted {
	@apply bg-blue-400/20 ring-1 ring-inset ring-blue-400/60;
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