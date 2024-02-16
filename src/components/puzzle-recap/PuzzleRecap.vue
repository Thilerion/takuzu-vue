<template>
	<teleport to="#overlay-container">
	<PuzzleRecapWrapper
		class="pointer-events-none"
		:show="shouldShow"
	>
		<template #content>
			<PuzzleRecapContent
				@exit-to="exitTo"
			
			></PuzzleRecapContent>
		</template>
	</PuzzleRecapWrapper>
	</teleport>
</template>

<script setup lang="ts">
import { useRecapStatsStore } from '@/stores/recap-stats';
import { computed, toRef } from 'vue';
import { usePuzzleRecapModalActions } from './usePuzzleRecapModalAction';


const props = defineProps<{
	finished: boolean
}>()

const finished = toRef(props, 'finished');

const recapStatsStore = useRecapStatsStore();

const modalShown = toRef(recapStatsStore, 'modalShown');
const shouldShow = computed(() => {
	return finished.value && modalShown.value;
})

const { exitTo } = usePuzzleRecapModalActions();
</script>

<style scoped>

</style>