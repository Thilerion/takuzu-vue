<template>
<slot :theme-data="themeData" :cell-component="cellComponent" />
</template>

<script setup lang="ts">
import { useCurrentCellComponent } from '@/features/board-cell/composables/current-cell-component.js';
import type { CellTheme } from '@/features/settings/types.js';
import type { MaybeRef } from 'vue';
import { useLocalCellTheme } from '@/features/board-cell/composables/cell-theme-provider.js';

const props = defineProps<{
	config: { theme: MaybeRef<CellTheme> }
}>();

const { ...themeData } = useLocalCellTheme(props.config.theme);
const cellComponent = useCurrentCellComponent(themeData.cellThemeType);

</script>