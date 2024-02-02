<template>
	<slot :theme-data="themeData" :theme-attrs="attrs" :theme-classes="classes" />
</template>

<script setup lang="ts">
import { useLocalCellThemeProvider, type LocalCellThemeConfig } from '../composables/useCellThemeProvider.js';

const props = defineProps<{
	config: LocalCellThemeConfig
}>();

const themeData = useLocalCellThemeProvider(props.config);
const { attrs, classes } = themeData;

</script>

<style scoped>

</style>