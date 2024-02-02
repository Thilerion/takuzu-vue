<template>
	<slot :theme-data="themeData" />
</template>

<script setup lang="ts">
import { useLocalCellThemeProvider, type LocalCellThemeConfig } from '../composables/useCellThemeProvider.js';

const props = defineProps<{
	config: LocalCellThemeConfig
}>();

const themeData = useLocalCellThemeProvider(props.config);

</script>

<style scoped>

</style>