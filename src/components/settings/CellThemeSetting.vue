<template>
	<div class="mt-2 flex items-center gap-x-2 max-w-md sm:px-0 sm:mx-0 mx-auto">
		<label
			v-for="(theme) in orderedCellThemes"
			:key="theme"
			:class="{ selected: cellTheme === theme }"
			class="flex flex-1 items-center cell-theme-box"
		>
			<CellThemeSettingExamples
				:theme="theme"
			/>
			<input
				class="radio"
				type="radio"
				name="radio-cell-theme"
				v-model="cellTheme"
				:value="theme"
			>
			<span class="label px-1">{{ cellThemeData[theme].label.value }}</span>
		</label>
	</div>
</template>

<script setup lang="ts">
import type { CellTheme } from '@/stores/settings/types.js';
import { computed } from 'vue';
import { initGlobalCellThemeProvider } from '../gameboard/composables/useCellThemeProvider.js';
import { useI18n } from 'vue-i18n';

initGlobalCellThemeProvider();
const { t } = useI18n();

const cellThemeData = {
	'blue-red': {
		label: computed(() => t('Settings.themes.blue-red')),
	},
	'classic': {
		label: computed(() => t('Settings.themes.classic')),
	},
	'tictactoe': {
		label: computed(() => t('Settings.themes.tic-tac-toe'))
	}
}
const orderedCellThemes: CellTheme[] = ['classic', 'tictactoe', 'blue-red'];

const props = defineProps<{
	modelValue: CellTheme
}>()
const emit = defineEmits<{
	'update:modelValue': [theme: CellTheme]
}>();
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

.cell-theme-box > .radio {
	grid-area: radio;
	@apply mx-auto focus:outline-none;
	box-shadow: none!important;
}
.cell-theme-box > .label {
	grid-area: label;
	@apply text-xs text-gray-800 mt-1 text-center truncate dark:text-white;
}
</style>