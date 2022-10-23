<template>
	<slot :theme-data="themeData" :theme-attrs="attrs" :theme-classes="classes" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCellThemeProvider } from './useCellThemeProvider';

const props = defineProps({
	config: {
		type: Object,
		required: true
	}
})

const { cellThemeType, cellTheme, attrs, classes, cellComponent } = useCellThemeProvider(props.config);


const themeData = computed(() => ({
	theme: cellTheme.value,
	themeType: cellThemeType.value,
	cellComponent: cellComponent.value
}))
</script>

<style scoped>

</style>