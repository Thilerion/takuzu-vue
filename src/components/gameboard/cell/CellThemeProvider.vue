<template>
	<slot :theme-data="themeData" :cell-component="cellComponent" />
</template>

<script setup lang="ts">
import { useLocalCellThemeProvider, type LocalCellThemeConfig } from '../composables/useCellThemeProvider.js';

const props = defineProps<{
	config: LocalCellThemeConfig
}>();

const { cellComponent, ...themeData } = useLocalCellThemeProvider(props.config);

</script>

<style scoped>

</style>