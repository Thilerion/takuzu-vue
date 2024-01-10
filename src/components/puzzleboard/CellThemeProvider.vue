<template>
	<slot :theme-data="themeData" :theme-attrs="attrs" :theme-classes="classes" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCellThemeProvider, type UseCellThemeConfig } from './useCellThemeProvider';

const props = defineProps<{
	config: UseCellThemeConfig
}>();

const { cellThemeType, cellTheme, attrs, classes, cellComponent } = useCellThemeProvider(props.config);

const themeData = computed(() => ({
	theme: cellTheme.value,
	themeType: cellThemeType.value,
	cellComponent: cellComponent.value
}))
</script>

<style scoped>

</style>