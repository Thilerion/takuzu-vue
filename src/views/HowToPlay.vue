<template>
	<div class="how-to-play flex flex-col pb-4">
		<PageHeader class="flex-shrink-0">How to play</PageHeader>
		<div class="content">
			<div class="content-grid grid gap-4 items-start justify-start">
				<div class="block">
					<h2>Rules</h2>
					<p>Each puzzle consists of a grid, initially filled with a small amount of 0s and 1s. </p>
					<p>The goal of the puzzle is to fill the grid with 0s and 1s according to the following rules:</p>
					<ol class="list-decimal pl-4">
						<li class="pl-2 leading-relaxed mb-1 transition-all" :class="{ 'mb-5': showExampleOne }">
							<div>Each row, and each column, contains an equal amount of 0s and 1s.</div>
							<BaseButton class="mb-2 text-xs h-min w-[18ch]" @click="showExampleOne = !showExampleOne"><span v-if="!showExampleOne">Show examples</span><span v-else>Hide examples</span></BaseButton>
							<ExpandTransition :duration-per-100-px="220" :show="showExampleOne">
								<div>
							<div class="rule-examples pb-4">
								<div class="text-sm mt-1 text-gray-700 dark:text-gray-200">Correct:</div>
								<PuzzleRowExample
									values="10101100"
								/>
								<div class="text-sm mt-1 text-gray-700 dark:text-gray-200">Incorrect:</div>
								<PuzzleRowExample
									values="10101101"
									:incorrect="[0, 2, 4, 5, 7]"
								/>
							</div>
							</div>
							</ExpandTransition>
						</li>
						<li class="pl-2 leading-relaxed mb-1">
							<div>There cannot be more than two 0s or 1s next to each other.</div>
							<BaseButton class="mb-2 text-xs h-min w-[18ch]" @click="showExampleTwo = !showExampleTwo"><span v-if="!showExampleTwo">Show examples</span><span v-else>Hide examples</span></BaseButton>
							<ExpandTransition :duration-per-100-px="220" :show="showExampleTwo">
								<div>
									<div class="rule-examples pb-4">
								<div class="text-sm mt-1 text-gray-700 dark:text-gray-200">Correct:</div>
								<PuzzleRowExample
									values="11..001."
								/>
								<div class="text-sm mt-1 text-gray-700 dark:text-gray-200">Incorrect:</div>
								<PuzzleRowExample
									values="111.001."
									:incorrect="[0, 1, 2]"
								/>
							</div>
								</div>
							</ExpandTransition>
							
						</li>
						<li class="pl-2 leading-relaxed mb-1">
							<div>No two rows, and no two columns can be the same.</div>
							<BaseButton class="mb-2 text-xs h-min w-[18ch]" @click="showExampleThree = !showExampleThree"><span v-if="!showExampleThree">Show examples</span><span v-else>Hide examples</span></BaseButton>
							<ExpandTransition :duration-per-100-px="220" :show="showExampleThree">
								<div>
									<div class="rule-examples pb-4">
								<div class="text-sm mt-1 text-gray-700 dark:text-gray-200">Correct:</div>
								<PuzzleRowExample
									values="01011001010110..01011010"
									:multirow="true"
									:highlight="[6, 7, 14, 15, 22, 23]"
									:rowlength="8"
								/>
								<div class="text-sm mt-1 text-gray-700 dark:text-gray-200">Incorrect:</div>
								<PuzzleRowExample
									multirow
									:rowlength="8"
									values="0101100101011001"
									:incorrect="[6, 7, 14, 15]"
								/>
							</div>
								</div>
							</ExpandTransition>
							
						</li>
					</ol>
				</div>
				<div class="block expansion-wrapper">
					<button @click="showVariationRules = !showVariationRules" class="flex flex-row items-center w-full py-2">
						<h2>Rules for puzzle variations</h2>
						<icon-ic-outline-keyboard-arrow-down class="ml-auto" :class="{rotated: showVariationRules }" />
					</button>
					<ExpandTransition :duration="350" @after-enter="afterEnterVariation" :show="showVariationRules">
					<div class="border-t" ref="variationRulesEl">
					<div
						class="expansion-block pt-2 bg-gray-50"
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
					</ExpandTransition>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';



const showExampleOne = ref(false);
const showExampleTwo = ref(false);
const showExampleThree = ref(false);

const showVariationRules = ref(false);
const variationRulesEl = ref<HTMLDivElement>();

function afterEnterVariation() {
	scrollVariationRulesIntoView();
}
function scrollVariationRulesIntoView() {
	const el = variationRulesEl.value;
	if (!el) {
		console.warn('Cannot scroll into view, no element found');
		return;
	}
	el.scrollIntoView({
		behavior: 'smooth'
	})
}
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
.expansion-block {
	@apply relative;
}
/* .expansion-block::before { */
	/* @apply absolute w-full h-px bg-red-500 z-10 content-[''] inset-x-0 top-0; */
	/* @apply border-t; */
/* } */
.expansion-wrapper h2 {
	@apply m-0 text-base;
}
.expansion-wrapper svg {
	@apply transition-transform;
}
.expansion-wrapper svg.rotated {
	@apply rotate-180;
}

li {
	@apply font-medium tracking-wide leading-6 text-gray-800 dark:text-gray-100;
}
li > div:first-child {
	@apply pb-2;
}
.rule-examples {
	@apply font-normal bg-gray-200/60 px-3 pt-2 pb-4 rounded-lg dark:bg-gray-700/60;
	@apply opacity-90;
}
</style>