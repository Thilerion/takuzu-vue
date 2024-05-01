<template>
<div
	class="puzzle-info"
	:class="{ 'has-border': hasBorder }"
>
	<div
		class="difficulty text-left"
	>{{ difficulty }}* {{ difficultyLabelMsg }}</div>

	<PuzzleInfoTimer
		v-if="showTimer"
		:puzzle-paused="puzzlePaused"
	/>

	<i18n-t
		keypath="PlayPuzzle.progress-percentage"
		tag="div"
		scope="global"
		class="progress text-right whitespace-nowrap"
	>
		<template #p>
			<div class="progress-percentage">{{ progressPercentage }}</div>
		</template>
	</i18n-t>

</div>
</template>

<script setup lang="ts">
import { DIFFICULTY_LABELS } from '@/config';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
	showTimer: boolean,
	difficulty: keyof typeof DIFFICULTY_LABELS,
	progressRatio: number,
	hasBorder: boolean,
	puzzlePaused: boolean
}>();

// Display the progress as, rounded and as percentage, while preventing it from being 100% if the puzzle is not yet solved.
const progressPercentage = computed(() => {
	const base = props.progressRatio;
	const rounded = Math.ceil(base * 100);
	// prevent progress from being 100 when not every cell is filled
	if (rounded == 100 && base < 1) return 99;
	return rounded;
})

const difficultyLabel = computed(() => DIFFICULTY_LABELS[props.difficulty]);
const { t } = useI18n();
const difficultyLabelMsg = computed(() => {
	const label = difficultyLabel.value;
	switch(label) {
		case 'Beginner': return t('Game.difficulty.Beginner');
		case 'Normal': return t('Game.difficulty.Normal');
		case 'Hard': return t('Game.difficulty.Hard');
		case 'Very Hard': return t('Game.difficulty.Very Hard');
		case 'Extreme': return t('Game.difficulty.Extreme');
		default: {
			const x: never = label;
			console.warn('Unknown difficulty label:', x);
			return t('Unknown');
		}
	}
});

</script>

<style scoped>
.puzzle-info {
	@apply px-1 pb-1 text-xs font-medium tracking-wider;
	@apply text-gray-500 dark:text-slate-300;
	@apply grid w-full;
	grid-template-rows: 1fr;
	grid-template-columns: calc(50% - 3ch) 6ch calc(50% - 3ch);
}

.puzzle-info.has-border {
	@apply border-b border-gray-400/20 dark:border-slate-100/20;
}

.progress-percentage {
	@apply inline-block text-right;
	width: 3.5ch;
}
.progress {
	grid-column: 3 / span 1;
}
</style>