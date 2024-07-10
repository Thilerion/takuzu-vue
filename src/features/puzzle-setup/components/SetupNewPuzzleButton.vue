<template>
<BaseButton
	:disabled="disabled || loading"
	class="btn-primary min-h-16 self-stretch h-full relative w-full mx-auto shadow disabled:shadow-none"
	@click="$emit('start')"
>
	<transition name="fade-start" mode="out-in">
		<div v-if="!loading" class="">
			<template v-if="!disabled">
				<div>{{ $t('NewPuzzle.StartGame.start-game') }} <small v-if="autoReplayMode" class="text-xs opacity-70 font-normal">({{ $t('Game.replay') }})</small></div>
				<span v-if="!disabled && singleDifficultyStr != null" class="text-xs">{{ sizeStr }} / {{ singleDifficultyStr }}</span>
				<span v-if="!disabled && difficultyRangeStr != null" class="text-xs">{{ sizeStr }} / {{ difficultyRangeStr }}</span>
			</template>
			<template v-else-if="disabled">
				<div class="text-white">{{ $t('NewPuzzle.StartGame.select-puzzle-size') }}</div>
				<div class="text-white/80 italic text-xs font-normal text-wrap leading-tight">{{ $t('NewPuzzle.StartGame.some-puzzle-sizes-are-disabled-for-harder-puzzles') }}</div>
			</template>
		</div>
		<div v-else-if="loading">
			<div class="absolute inset-y-0 w-1/3 left-0 flex justify-center items-center">
				<LoadingSpinner :size="32" />
			</div>
			<span v-if="!autoReplayMode">{{ $t('NewPuzzle.StartGame.loading-creating-game') }}</span>
			<span v-else>{{ $t('NewPuzzle.StartGame.loading-loading-replay') }}</span>
		</div>
	</transition>
</BaseButton>
</template>

<script setup lang="ts">
import type { BoardShape, DifficultyKey } from '@/lib/types.js';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { DIFFICULTY_LABELS } from '@/config.js';
import { type DifficultyRange, isDifficultyRange } from '../helpers/puzzle-setup-config.js';

const props = defineProps<{
	size: BoardShape | BoardShape[] | null,
	difficulty: DifficultyKey | DifficultyRange | null,
	autoReplayMode: boolean,

	loading: boolean,
}>();
defineEmits<{
	(e: 'start'): void
}>();

const disabled = computed(() => {
	return props.difficulty == null || props.size == null;
})

const toSizeStr = ({ width, height }: BoardShape) => {
	return `${width}x${height}`;
}
const { t } = useI18n();
const sizeStr = computed(() => {
	// TODO: if too long, just say [n sizes selected]
	if (props.size == null) return '';
	else if (Array.isArray(props.size)) {
		const n = props.size.length;
		if (n >= 5) return t('NewPuzzle.StartGame.many-sizes-selected', [n]);
		return props.size.map(toSizeStr).join(', ');
	} else {
		return toSizeStr(props.size);
	}
})

const diffs = computed((): DifficultyKey | DifficultyRange | null => {
	if (props.difficulty == null) return null;
	if (Array.isArray(props.difficulty)) {
		const [min, max] = props.difficulty;
		if (min === max) return min;
		return [min, max] as DifficultyRange;
	} else return props.difficulty as DifficultyKey;
})
const singleDifficultyStr = computed(() => {
	const diff = diffs.value;
	if (diff == null || isDifficultyRange(diff) || (typeof diff !== 'number' && typeof diff !== 'string')) return null;

	const label = DIFFICULTY_LABELS[diff];
	const a = t(`Game.difficulty.${label}`, label);
	const b = `${diff}*`;
	return `${a} - ${b}`;
})
const difficultyRangeStr = computed(() => {
	if (diffs.value == null || !isDifficultyRange(diffs.value)) return null;
	return `${diffs.value[0]}* - ${diffs.value[1]}*`;
})
</script>

<style scoped>

</style>