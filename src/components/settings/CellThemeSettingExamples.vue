<template>
<div class="examples" :class="[`cell-theme-${theme}`]">
	<CellThemeProvider v-slot="{ cellComponent }" :config="{ theme }">
		<div class="w-6 h-6 relative cell-example-wrapper">
			<component
				:is="cellComponent"
				value="0"
				class="zero"
			/>
		</div>
		<div class="w-6 h-6 relative cell-example-wrapper">
			<component
				:is="cellComponent"
				value="1"
				class="one"
			/>
		</div>
	</CellThemeProvider>
</div>
</template>

<script setup lang="ts">
import type { CellTheme } from '@/stores/settings/types.js';

defineProps<{
	theme: CellTheme
}>();
</script>

<style scoped>
.examples {
	grid-area: cell;
	@apply flex mx-auto gap-x-1;
	--cell-rounding: 2px;
}

.cell-example-wrapper {
	contain: strict;
	container-type: size;
	--base-cell-size: 100cqmin;
}
.zero {
	@apply border mr-1 border-gray-300 dark:border-slate-400;
}
.one {
	@apply border border-gray-300 dark:border-slate-400;
}
.cell-theme-blue-red .one, .cell-theme-blue-red .zero {
	border: none;
}
</style>