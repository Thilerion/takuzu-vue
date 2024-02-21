<template>
	<div
		class="prose prose-sm md:prose lg:prose-lg xl:prose-xl mx-auto how-to-play-overview"
	>
		<p>Welcome to Takuzu! This puzzle type, also known as a binary puzzle, is a delightful blend of logic and strategy.
			Perfect for puzzle enthusiasts and newcomers alike, it offers a unique mental challenge. Our guide is here to
			help you grasp the basics and discover the fun in every grid. Let's get started!</p>

		<h2>Basic Rules</h2>
		<p>The goal of a binary puzzle is simple: fill every cell of the grid with a <SymbolDisplay v="0"/> or a <SymbolDisplay v="1"/> according to some simple
			rules. These 3 key rules are:</p>

		<h3 class="rule-heading">Balanced Lines</h3>
		<ul>
			<li>Each row and column must have an equal number of <SymbolDisplay v="1" mult /> and <SymbolDisplay v="0" mult />.</li>
			<li>For example, in a 4x4 grid, each row and column should contain two <SymbolDisplay v="1" mult /> and two <SymbolDisplay v="0" mult />.</li>
			<HowToPlayExample label="Correct: ">
				<template #examples>
					<HowToPlayExampleCells
						:values="('110010'.split('') as PuzzleValueLine)"
					/>
				</template>
				<template #explanation>
					There are exactly 3 <SymbolDisplay :v="ZERO" mult /> and 3 <SymbolDisplay :v="ONE" mult /> in the line of 6 cells.
				</template>
			</HowToPlayExample>
			<HowToPlayExample label="Incorrect: ">
				<template #examples>
					<HowToPlayExampleCells
						:values="('010010'.split('') as PuzzleValueLine)"
						:incorrect="[0, 2, 3, 5]"
					/>
				</template>
				<template #explanation>
					There are 4 <SymbolDisplay v="0" mult />, but the row has 6 cells, which means only three <SymbolDisplay v="0" mult /> are allowed.
				</template>
			</HowToPlayExample>
		</ul>

		<h3 class="rule-heading">Max Two Consecutive</h3>
		<ul>
			<li>No more than two of the same number can be next to or under each other.</li>
			<li>This means you cannot have three consecutive <SymbolDisplay v="1" mult /> or <SymbolDisplay v="0" mult /> in any row or column.</li>
			<HowToPlayExample label="Correct: ">
				<template #examples>
					<HowToPlayExampleCells
						:values="('11..00'.split('') as PuzzleValueLine)"
					/>
				</template>
				<template #explanation>
					Two <SymbolDisplay v="1" mult /> in a row, and two <SymbolDisplay v="0" mult /> in a row is allowed.
				</template>
			</HowToPlayExample>
			<HowToPlayExample label="Incorrect: ">
				<template #examples>
					<HowToPlayExampleCells
						:values="('111.00'.split('') as PuzzleValueLine)"
						:incorrect="[0, 1, 2]"
					/>
				</template>
				<template #explanation>
					Three <SymbolDisplay v="1" mult /> in a row is not allowed.
				</template>
			</HowToPlayExample>
		</ul>

		<h3 class="rule-heading">Unique Rows and Columns</h3>
		<ul>
			<li>Each row and each column must be unique.</li>
			<li>No two rows can be the same, and no two columns can be the same.</li>
			<HowToPlayExample label="The first row here looks similar to the second row:">
				<template #examples>
					<HowToPlayExampleCells
						:values="('1.0.'.split('') as PuzzleValueLine)"
						:highlight="[1, 3]"
					/>
					<HowToPlayExampleCells
						:values="('1001'.split('') as PuzzleValueLine)"
						:highlight="[1, 3]"
					/>
					<HowToPlayExampleCells
						:values="('0110'.split('') as PuzzleValueLine)"
						class="opacity-40"
					/>
					<HowToPlayExampleCells
						:values="('0.1.'.split('') as PuzzleValueLine)"
						class="opacity-40"
					/>
					<div class="my-1">It can only be filled in one way to prevent two duplicate rows:</div>
					<HowToPlayExampleCells
						:values="('1100'.split('') as PuzzleValueLine)"
						:highlight="[1, 3]"
					/>
					<HowToPlayExampleCells
						:values="('1001'.split('') as PuzzleValueLine)"
						:highlight="[1, 3]"
					/>
					<HowToPlayExampleCells
						:values="('0110'.split('') as PuzzleValueLine)"
						class="opacity-40"
					/>
					<HowToPlayExampleCells
						:values="('0.1.'.split('') as PuzzleValueLine)"
						class="opacity-40"
					/>
					<div class="my-1">In the same fashion, the last two rows can only be filled one way. The following would be incorrect, as the last two rows are now the same:</div>
					<HowToPlayExampleCells
						:values="('1100'.split('') as PuzzleValueLine)"
						class="opacity-40"
					/>
					<HowToPlayExampleCells
						:values="('1001'.split('') as PuzzleValueLine)"
						class="opacity-40"
					/>
					<HowToPlayExampleCells
						:values="('0110'.split('') as PuzzleValueLine)"
						:incorrect="[1, 3]"
					/>
					<HowToPlayExampleCells
						:values="('0110'.split('') as PuzzleValueLine)"
						:incorrect="[1, 3]"
					/>
				</template>
			</HowToPlayExample>
		</ul>

		<h2>Puzzle Variations</h2>
		<p>In addition to standard puzzles, there is one puzzle variation available:</p>
		<h3>Odd-Sized Puzzles</h3>
		<ul>
			<li>In puzzles with an odd number of rows and columns, the rule for balanced lines is slightly altered.</li>
			<li>In these cases, each line will have one more 1 than 0.</li>
			<li>This means in a 5x5 grid, each row and column should contain three <SymbolDisplay v="1" mult /> and two <SymbolDisplay v="0" mult />.</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import type { PuzzleValueLine } from '@/lib/types.js';
import { ONE, ZERO } from '@/lib/constants.js';
</script>

<style scoped>
.how-to-play-overview {
	counter-reset: rule-heading 0;
}
.rule-heading {
	@apply relative pl-[1.875ch];
}
.rule-heading::before {
	counter-increment: rule-heading 1;
	content: counter(rule-heading)".";
	@apply absolute left-0 opacity-60;
}
</style>