<template>
<div
	class="cell"
	:class="[
		{
			locked,
			incorrect: !!incorrect,
			highlighted: !!highlighted,
			empty: value === EMPTY
		},
		themeClasses
	]"
>
	<transition name="cell-symbol">
		<div
			v-if="symbolValue !== ''"			
			:class="{
				'number-icon-wrapper': symbolType === 'classic',
				'tictactoe-icon-wrapper': symbolType === 'tictactoe'
			}"
		>
			<template v-if="symbolType === 'classic'">
				<icon-tabler-number-0 v-if="symbolValue === '0'" class="zero number-icon" />
				<icon-tabler-number-1 v-else-if="symbolValue === '1'" class="one number-icon" />
			</template>
			<template v-if="symbolType === 'tictactoe'">
				<span v-if="symbolValue === 'O'" class="zero cell-symbol-value">O</span>
				<span v-else-if="symbolValue === 'X'" class="one cell-symbol-value">X</span>
			</template>
		</div>
	</transition>
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
import { EMPTY, ONE, ZERO, type PuzzleValue } from "@/lib/constants.js";
import { computed, toRefs } from "vue";
import { useCellTheme } from "../composables/cell-theme-provider.js";

const props = defineProps<{
	value: PuzzleValue,
	locked?: boolean,
	incorrect?: boolean,
	highlighted?: boolean
}>()

const { value, locked, incorrect } = toRefs(props);

const { cellTheme: symbolType, cellClasses: themeClasses } = useCellTheme();

const symbolMap = computed(() => {
	if (symbolType.value === 'classic') return BinarySymbols;
	else if (symbolType.value === 'tictactoe') return TicTacToeSymbols;
	throw new Error(`Unrecognized symbolType (accepts binary and tictactoe): ${symbolType.value}`);
})

const symbolValue = computed(() => symbolMap.value[value.value]);
</script>

<style scoped>
/* Base cell styles */
.cell {
	@apply overflow-hidden relative pointer-events-none flex;
	@apply w-full h-full;
	@apply bg-gray-125 dark:bg-slate-700/30 dark:shadow-glow-inner-sm;
}
.cell > *, .cell {
	border-radius: var(--cell-rounding);
}

/* Base cell styles: states; empty/locked/incorrect/highlighted */
.cell.empty {
	@apply dark:shadow-white/60;
}
.cell:not(.empty) {
	@apply dark:shadow-white/60;
}

.cell.locked {
	@apply bg-gray-150 dark:bg-slate-775 dark:shadow-white/30;
}

.cell.highlighted {
	@apply bg-blue-400/20 ring-1 ring-inset ring-blue-400/60;
}

.cell.incorrect {
	@apply bg-red-400/20 ring-1 ring-inset ring-red-900/40 dark:ring-red-400/70 dark:bg-red-400/40;
}

/* Symbol/value specific styles */
.zero {
	@apply text-cyan-700 dark:text-cyan-500;
}
.cell.incorrect .zero {
	@apply text-cyan-800 dark:text-cyan-300;
}
.one {
	@apply text-gray-600 dark:text-gray-200;
}
.cell.incorrect .one {
	@apply text-gray-700 dark:text-white/90;
}

/* Theme: Binary/Classic */
.number-icon-wrapper {
	@apply relative box-border w-full h-full flex;
	padding: 2px;
}
.number-icon {
	@apply pointer-events-none w-full h-full m-auto;
	font-size: var(--font-size);
	max-height: 4rem;
	max-width: 4rem;
}
.cell-theme-binary.cell .cell-symbol-value {
	@apply font-number;
	--base-size: calc(100cqmin - 4px);
}


/* Theme: TicTacToe */
.cell-symbol-value {
	@apply m-auto;
}
.cell-symbol-value {
	--font-size: clamp(16px, var(--base-size), 48px);
}
.cell-theme-tictactoe.cell .cell-symbol-value {
	@apply font-sans;
	--base-size: calc(90cqmin + 4px - 1vmin);
	font-size: calc(var(--base-size) * 0.9);
}
.cell-theme-tictactoe.cell {
	@apply flex items-center justify-center overflow-hidden;
	--font-size: 48px;
	--base-pad: clamp(1px, 10cqmin, 57px);
	--top-pad-shift: clamp(1px, 3cqh, var(--base-pad) * 0.5);
	padding: var(--base-pad);
	padding-top: calc(var(--base-pad) + var(--top-pad-shift));
	width: 100%;
	height: 100%;
}

/* Cell symbol/value transitions */
.cell-symbol-enter-active, .cell-symbol-leave-active {
	transition: opacity 0.05s ease .05s;
}
.cell-symbol-enter-from, .cell-symbol-leave-to {
	opacity: 0;
}
</style>