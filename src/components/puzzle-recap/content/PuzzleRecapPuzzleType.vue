<template>
	<div class="flex flex-row justify-evenly gap-3 text-center py-3 px-2 text-sm relative">
		<div class="py-2 px-4 w-1/3 text-center top-3 relative">
			<div class="tracking-[0.15em] text-white/80 font-medium uppercase text-center text-xxs">Size</div>
			<div class="min-w-max h-[1.15em]">{{width}}x{{height}}</div>
		</div>
		<div class="py-2 px-4 flex-1 min-w-[30%] text-center rounded-full bg-gray-800/0">
			<div class="tracking-[0.15em] text-white/80 font-medium uppercase text-center text-xxs">Solved</div>
			<div class="min-w-max h-[1.15em]">{{solved}}</div>
		</div>
		<div class="py-2 px-4 w-1/3 text-center top-3 relative">
			<div class="tracking-[0.15em] text-white/80 font-medium uppercase text-center text-xxs">Difficulty</div>
			<div class="min-w-max h-[1.15em]">{{difficultyStars}}*<span v-if="difficultyLabel">&nbsp;-&nbsp;{{difficultyLabel}}</span></div>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	width: {
		type: Number,
		required: true
	},
	height: {
		type: Number,
		required: true
	},
	difficultyStars: {
		type: Number,
		required: true
	},
	difficultyLabel: {
		type: String,
		required: true
	},
	solved: {
		type: Number,
		required: true
	}
});
</script>