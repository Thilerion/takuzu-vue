<template>
	<CoordsRuler 
		v-if="componentType === 'coords'"
		:line-type="rulerLineType"
		:line-ids="lineIds"
	/>
	<CountsRuler
		v-else-if="componentType === 'count'"
		:count-type="countType!"
		:line-type="rulerLineType"
		:cell-size="cellSize"
	/>
</template>

<script setup lang="ts">
import type { RulerCountType } from './CountsRuler.vue.js';
import type { LineId } from '@/lib/types.js';
import type { RulerComponentType } from '@/stores/settings/store.js';

defineProps<{
	rulerLineType: 'rows' | 'columns',
	cellSize: number,
	countType: RulerCountType | null,
	lineIds: LineId[],
	componentType: RulerComponentType
}>();
</script>

<style scoped>

</style>