<template>
	<div class="how-to-play flex flex-col">
		<PageHeader>How to play</PageHeader>
		<div class="content">
			<div class="content-grid grid gap-4 items-start justify-start">
				<div class="block">
					<h2>Rules</h2>
					<p>Each puzzle consists of a grid, initially filled with a small amount of 0s and 1s. </p>
					<p>The goal of the puzzle is to fill the grid with 0s and 1s according to the following rules:</p>
					<ol class="list-decimal pl-4">
						<li class="pl-2 leading-relaxed mb-1">Each row, and each column, contains an equal amount of 0s and 1s.</li>
						<li class="pl-2 leading-relaxed mb-1">There cannot be more than two 0s or 1s next to each other.</li>
						<li class="pl-2 leading-relaxed mb-1">No two rows, and no two columns can be the same.</li>
					</ol>
				</div>
				<div class="expansion-block">

				</div>
				<div class="block expansion-wrapper">
					<button @click="showVariationRules = !showVariationRules" class="flex flex-row items-center w-full py-2" :class="{'border-b': showVariationRules}">
						<h2>Rules for puzzle variations</h2>
						<icon-ic-outline-keyboard-arrow-down class="ml-auto" :class="{rotated: showVariationRules }" />
					</button>
					<div
						class="expansion-block pt-2 bg-gray-50"
						v-show="showVariationRules"
					>
					<div>
						<h3>Odd puzzles</h3>
						<p>These puzzles are always square, and have an odd amount of columns and rows (such as 7x7 and 11x11).</p>
						<p>Therefore, an <strong>extra 1</strong> must be placed in each row and column.</p>
					</div>
					<div class="mt-4">
						<h3>Rectangular puzzles</h3>
						<p>These puzzles have a different amount of columns than rows.</p>
					</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';

const showVariationRules = ref(false);
</script>

<style scoped>
.how-to-play {
	@apply overflow-x-hidden fixed inset-0 overscroll-y-auto;
}

.content {
	@apply px-6 pt-2 pb-4 flex-1;
}

p {
	@apply leading-relaxed mb-2;
}

h2, h3 {
	@apply text-lg font-medium mb-2;
}
h2 {
	@apply mb-2;
}
h3 {
	@apply mb-1 opacity-70 text-base;
}

ol {
	@apply pt-2;
}

.expansion-wrapper {
	@apply border border-gray-400/20 rounded;
}

.expansion-wrapper > button {
	@apply bg-gray-100 dark:bg-slate-700;
}
.expansion-wrapper > * {
	@apply px-2;
}
.expansion-wrapper h2 {
	@apply m-0 text-base;
}
.expansion-wrapper svg {
	@apply transition-transform;
}
.expansion-wrapper svg.rotated {
	@apply rotate-180;
}
</style>