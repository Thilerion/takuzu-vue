<template>
<i18n-t
	:tag="tag"
	:keypath="keypath"
	scope="global"
>
	<template #symbolZero><PuzzleSymbolDisplay v="0" /></template>
	<template #symbolOne><PuzzleSymbolDisplay v="1" /></template>
	<template #symbolZeroPlural><PuzzleSymbolDisplay v="0" mult /></template>
	<template #symbolOnePlural><PuzzleSymbolDisplay v="1" mult /></template>
	<template #symbolOrColor>{{ valueTypeDisplay }}</template>
	<template #symbolOrColorPlural>{{ valueTypeDisplayPlural }}</template>
</i18n-t>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDynamicPuzzleSymbolString } from '@/components/dynamic-symbols/useDynamicPuzzleSymbolString.js';
import { useI18n } from 'vue-i18n';
import { useCellTheme } from '@/features/board-cell/composables/cell-theme-provider.js';

defineProps<{
	keypath: string,
	tag: string | undefined,
}>();

const { cellTheme, cellThemeType } = useCellTheme();
const { $p } = useDynamicPuzzleSymbolString(
	cellTheme, cellThemeType
);
const { t } = useI18n();
const valueTypeDisplay = computed(() => {
	return t($p('symbol', false));
})
const valueTypeDisplayPlural = computed(() => {
	return t($p('symbol', true));
})
</script>