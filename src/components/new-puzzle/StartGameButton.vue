<template>
<BaseButton
	:disabled="disabled || loading"
	class="btn-primary min-h-16 self-stretch h-full relative w-full mx-auto shadow disabled:shadow-none"
	@click="$emit('start')"
>
	<transition name="fade-start" mode="out-in">
		<div v-if="!loading">
			<template v-if="!disabled">
				<div>{{ $t('NewPuzzle.StartGame.start-game') }} <small v-if="replay" class="text-xs opacity-70 font-normal">({{ $t('Game.replay') }})</small></div>
				<div v-if="!disabled" class="text-xs">{{ sizeStr }} - {{ $t(difficultyLabelMsgKey, difficultyLabel) }} - {{ difficultyStars }}*</div>
			</template>
			<template v-else-if="disabled">
				<div>{{ $t('NewPuzzle.StartGame.select-puzzle-size') }}</div>
				<div class="text-xs font-normal text-wrap leading-tight">{{ $t('NewPuzzle.StartGame.some-puzzle-sizes-are-disabled-for-harder-puzzles') }}</div>
			</template>
		</div>
		<div v-else-if="loading">
			<div class="absolute inset-y-0 w-1/3 left-0 flex justify-center items-center">
				<LoadingSpinner :size="32" />
			</div>
			<span v-if="!replay">{{ $t('NewPuzzle.StartGame.loading-creating-game') }}</span>
			<span v-else>{{ $t('NewPuzzle.StartGame.loading-loading-replay') }}</span>
		</div>
	</transition>
</BaseButton>
</template>

<script setup lang="ts">
import type { BoardShape, DifficultyKey } from '@/lib/types.js';
import { computed } from 'vue';

type StartGameButtonProps = {
	disabled?: boolean,
	loading?: boolean,
	replay?: boolean,
	difficultyLabel: string,
	difficultyStars: DifficultyKey,
	size: BoardShape
}

defineEmits<{
	(e: 'start'): void
}>();

const props = defineProps<StartGameButtonProps>();

const sizeStr = computed(() => {
	return `${props.size.width}x${props.size.height}`;
})

const difficultyLabelMsgKey = computed(() => {
	return `Game.difficulty.${props.difficultyLabel}`;
})
</script>

<style scoped>
.fade-start-enter-active, .fade-start-leave-active {
	transition: opacity .1s ease;
}
.fade-start-enter-from, .fade-start-leave-to {
	opacity: 0;
}
</style>