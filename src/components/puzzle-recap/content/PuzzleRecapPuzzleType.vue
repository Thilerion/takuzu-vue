<template>
	<div class="flex flex-row justify-evenly gap-3 text-center pt-4 pb-4 px-2 text-sm relative">
		<div class="py-2 px-4 w-1/3 text-center top-2 relative">
			<div class="tracking-[0.15em] text-white/80 font-medium uppercase text-center text-xxs">{{ $t('Recap.size-label') }}</div>
			<div class="min-w-max h-[1.15em]">{{width}}x{{height}}</div>
		</div>
		<div class="py-2 px-4 flex-1 min-w-[30%] text-center rounded-full bg-gray-800/0">
			<div class="tracking-[0.15em] text-white/80 font-medium uppercase text-center text-xxs">{{ $t('Recap.solved-label') }}</div>
			<div class="min-w-max h-[1.15em]">{{solved}}</div>
		</div>
		<div class="py-2 px-4 w-1/3 text-center top-2 relative">
			<div class="tracking-[0.15em] text-white/80 font-medium uppercase text-center text-xxs">{{ $t('Recap.difficulty-label') }}</div>
			<div class="min-w-max h-[1.15em]">{{difficultyStars}}*<span v-if="difficultyLabel">&nbsp;-&nbsp;{{$t(`Game.difficulty.${difficultyLabel}`, difficultyLabel)}}</span></div>
		</div>
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	width: number,
	height: number,
	difficultyStars: number,
	difficultyLabel: string,
	solved: number
}>();
</script>