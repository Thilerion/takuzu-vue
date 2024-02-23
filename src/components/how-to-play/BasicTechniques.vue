<template>
	<div class="prose prose-sm md:prose lg:prose-lg xl:prose-xl mx-auto py-4 px-0 basic-techniques-page relative">
		<h2>Basic Techniques</h2>
		<p>Below, we've outlined some fundamental strategies to help you navigate through the puzzles with ease.</p>

		<div class="techniques breakout">
			<h3>Identifying Pairs and Sandwiches</h3>
			<p>A direct application of the "max two consecutive" rule is to avoid forming triplets within the puzzle grid.
			</p>

			<h4>Pairs</h4>
			<p>Whenever you observe two identical {{ valueTypeDisplayPlural }} next to each other, either horizontally or
				vertically, this forms a "pair." The cells immediately adjacent to this pair must be filled with the
				other {{ valueTypeDisplay }} to prevent creating a sequence of three identical {{ valueTypeDisplayPlural
				}} (a triplet).</p>
			<HowToPlayExample el="div" label="" class="border-y breakout px-8 py-4">
				<template #examples>
					<HowToPlayExampleCells :values="splitLine('.00.')" />
					<span class="">Becomes:</span>
					<HowToPlayExampleCells :values="splitLine('1001')" />
				</template>
			</HowToPlayExample>

			<h4>Sandwiches</h4>
			<p>A "sandwich" occurs when an empty cell is flanked by two identical {{ valueTypeDisplayPlural }}. This setup
				mandates that the empty cell, effectively the "filling" of the sandwich, be filled with the other {{
					valueTypeDisplay }} to avoid the formation of triplets.</p>
			<HowToPlayExample el="div" label="" class="border-y breakout px-8 py-4">
				<template #examples>
					<HowToPlayExampleCells :values="splitLine('.1.1..')" />
					<span class="">Becomes:</span>
					<HowToPlayExampleCells :values="splitLine('.101..')" />
				</template>
			</HowToPlayExample>

			<h3>Completing Rows and Columns</h3>
			<p>This technique stems from the "balanced lines" rule, which stipulates that each row and column must contain
				an equal number of zeros and ones. As you fill in the puzzle, keep track of the balance within each row and
				column to guide your placement decisions.</p>
			<p><strong>Tip: </strong> A setting is available that adds a horizontal and vertical ruler to the puzzle grid.
				These rulers display how many of each {{ valueTypeDisplay }} still need to be placed in that row or column,
				and highlight whenever a line has none remaining of a single {{ valueTypeDisplay }}, which means it can be
				completed with the other {{ valueTypeDisplay }}.</p>
			<HowToPlayExample el="div" label="" class="border-y breakout px-8 pb-0 pt-4">
				<template #examples>
					<HowToPlayExampleCells :values="splitLine('1..110')" />
					<HowToPlayExampleCells :values="splitLine('100110')" />
				</template>
				<template #explanation>This row has 6 cells, which means there are 3 of each {{ valueTypeDisplay }} required. As you can see in the top row, there are 3 <SymbolDisplay :v="'1'" mult />, which means all other cells should be <SymbolDisplay v="0" mult/>.</template>
			</HowToPlayExample>

			<h3>Unique Rows and Columns</h3>
			<p>This strategy is often not a necessity for solving puzzles, especially at easier difficulties, thanks to the
				tailored puzzle generation algorithm. Its utility shines on smaller boards or during tougher challenges
				where other strategies might leave you in a standstill.</p>
			<p><strong>When to use: </strong>It's especially helpful in scenarios where a line is almost complete yet cannot
				be completed using the basic rules of balancing, sandwiches, or pairs. If you're leveraging the rulers
				setting that indicates the remaining number of each {{ valueTypeDisplay }} needed in a row or column, pay
				close attention to lines that require the placement of exactly one
				<SymbolDisplay v="1" /> and one
				<SymbolDisplay v="0" />. Compare these scenarios
				with existing lines to identify the correct placements.
			</p>
			<HowToPlayExample class="border-y breakout px-8 py-4" el="div" label="Consider this 4x4 puzzle. Two rows are already completed, and the first row looks similar to the second row:">
				<template #examples>
					<HowToPlayExampleCells
						class="mt-2"
						:values="splitLine('1.0.')"
						:highlight="[1, 3]"
					/>
					<HowToPlayExampleCells
						:values="splitLine('1001')"
						:highlight="[1, 3]"
					/>
					<HowToPlayExampleCells
						:values="splitLine('0110')"
						class="opacity-40"
					/>
					<HowToPlayExampleCells
						:values="splitLine('0.1.')"
						class="opacity-40"
					/>
					<div class="my-1">It can only be filled in one way to prevent two duplicate rows:</div>
					<HowToPlayExampleCells
						:values="splitLine('1100')"
						:highlight="[1, 3]"
					/>
					<HowToPlayExampleCells
						:values="splitLine('1001')"
						:highlight="[1, 3]"
					/>
					<HowToPlayExampleCells
						:values="splitLine('0110')"
						class="opacity-40"
					/>
					<HowToPlayExampleCells
						:values="splitLine('0.1.')"
						class="opacity-40"
					/>
				</template>
			</HowToPlayExample>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { injectCellThemeData } from '../gameboard/composables/useCellThemeProvider.js';
import { useDynamicPuzzleSymbolString } from '../dynamic-symbols/useDynamicPuzzleSymbolString.js';
import SymbolDisplay from '@/components/dynamic-symbols/PuzzleSymbolDisplay.vue';
import type { PuzzleValueLine } from '@/lib/types.js';
import { splitLine } from '@/lib/utils.js';

const { theme: cellTheme, type: cellThemeType } = injectCellThemeData();
const { $p } = useDynamicPuzzleSymbolString(
	cellTheme, cellThemeType
);
const valueTypeDisplay = computed(() => {
	return $p('symbol', false)
})
const valueTypeDisplayPlural = computed(() => {
	return $p('symbol', true)
})
</script>

<style scoped>
.basic-techniques-page {
	counter-reset: technique-heading 0;
}
.basic-techniques-page > *:not(.breakout) {
	@apply px-8;
}
.techniques > *:not(.breakout) {
	@apply mx-8;
}

.techniques h3 {
	@apply relative pl-[1.875ch];
}

.techniques h4 {
	@apply relative pl-[3ch];
}

.techniques h3 {
	counter-reset: sub-technique-heading 0;
}

.techniques h3::before {
	counter-increment: technique-heading 1;
	content: counter(technique-heading)".";
	@apply absolute left-0 opacity-60;
}

.techniques h4::before {
	counter-increment: sub-technique-heading 1;
	content: counter(technique-heading) counter(sub-technique-heading, lower-alpha)".";
	@apply absolute left-0 opacity-60;
}
</style>