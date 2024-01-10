<template>
	<div class="mt-2 flex items-center gap-x-2 max-w-md sm:px-0 sm:mx-0 mx-auto">
		<label class="flex flex-1 items-center cell-theme-box" :class="{selected: cellTheme === CellThemes.CLASSIC}">
			<div class="example cell-theme-01">
				<div class="zero">0</div>
				<div class="one">1</div>
			</div>
			<input
				class="radio"
				type="radio"
				name="radio-cell-theme"
				v-model="cellTheme"
				:value="CellThemes.CLASSIC"
			>
			<span
				class="label"
			>Classic</span>
		</label>
		<label class="flex flex-1 items-center cell-theme-box" :class="{selected: cellTheme === CellThemes.TICTACTOE}">
			<input
				class="radio"
				type="radio"
				name="radio-cell-theme"
				v-model="cellTheme"
				:value="CellThemes.TICTACTOE"
			>
			<span
				class="label"
			>Tic-tac-toe</span>
			<div class="example cell-theme-OX">
				<div class="zero">O</div>
				<div class="one">X</div>
			</div>
		</label>
		<label class="flex flex-1 items-center cell-theme-box" :class="{selected: cellTheme === CellThemes.BLUE_RED}">
			<input
				class="radio"
				type="radio"
				name="radio-cell-theme"
				v-model="cellTheme"
				:value="CellThemes.BLUE_RED"
			>
			<span
				class="label"
			>Tiles</span>
			<div class="example cell-theme-blue-red">
				<div class="zero"></div>
				<div class="one"></div>
			</div>
		</label>
	</div>
</template>

<script setup lang="ts">
import { CellThemes } from '@/stores/settings/options';
import type { CellTheme } from '@/stores/settings/types.js';
import { computed } from 'vue';

const props = defineProps<{
	modelValue: CellTheme
}>()
const emit = defineEmits(['update:modelValue']);
const cellTheme = computed({
	get() {
		return props.modelValue;
	},
	set(value) {
		emit('update:modelValue', value);
	}
})
</script>

<style scoped>
.cell-theme-box {
	grid-template-areas: "cell cell"
						"label label"
						"radio radio";
	grid-template-rows: auto 1.5rem 2rem;
	grid-template-columns: auto auto;
	@apply rounded bg-white dark:bg-slate-700 dark:text-white ring-1 ring-gray-400 ring-opacity-40 grid items-center justify-items-stretch px-0 pt-2 flex-1 transition-all duration-200 cursor-pointer;
	/* row-gap: 0.25rem; */
}
.cell-theme-box.selected {
	@apply ring-2 ring-teal-700 ring-opacity-60 dark:ring-teal-500;
	@apply bg-teal-100/20 dark:bg-teal-100/10;
	@apply shadow-lg shadow-teal-600/20 dark:shadow-teal-600/40;
}
.cell-theme-box:not(.selected) {
	@apply bg-white dark:bg-slate-700/40 text-gray-500 shadow-transparent shadow-lg;
}

.cell-theme-box > .example {
	grid-area: cell;
	@apply flex mx-auto;
}
.example > .one, .example > .zero {
	@apply w-6 h-6 justify-center items-center text-center my-1 rounded bg-gray-50 dark:bg-slate-600 overflow-hidden text-gray-800 dark:text-gray-200;
}
.zero {
	@apply border mr-1 border-gray-300 dark:border-slate-400;
}
.one {
	@apply border border-gray-300 dark:border-slate-400;
}

.cell-theme-box > .radio {
	grid-area: radio;
	@apply mx-auto focus:outline-none;
	box-shadow: none!important;
}
.cell-theme-box > .label {
	grid-area: label;
	@apply text-xs text-gray-800 mt-1 text-center truncate dark:text-white;
}

.cell-theme-01 {
	@apply font-number;
}
.cell-theme-OX {
	@apply font-sans font-bold;
}
.cell-theme-blue-red {
	@apply text-opacity-0;
}
.cell-theme-blue-red .one {
	@apply dark:bg-cell-red-secondary bg-cell-red-primary border-0;
}
.cell-theme-blue-red .zero {
	@apply dark:bg-cell-blue-secondary bg-cell-blue-primary border-0;
}
</style>