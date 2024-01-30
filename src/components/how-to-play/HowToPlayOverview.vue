<template>
	<div class="prose prose-sm md:prose lg:prose-lg xl:prose-xl mx-auto p-4 how-to-play-overview">
		<p>Welcome to Takuzu! This puzzle type, also known as a binary puzzle, is a delightful blend of logic and strategy.
			Perfect for puzzle enthusiasts and newcomers alike, it offers a unique mental challenge. Our guide is here to
			help you grasp the basics and discover the fun in every grid. Let's get started!</p>

		<h2>Basic Rules</h2>
		<p>The goal of a binary puzzle is simple: fill every cell of the grid with a 1 or a 0 according to some simple
			rules. These 3 key rules are:</p>

		<h3 class="rule-heading">Balanced Lines</h3>
		<ul>
			<li>Each row and column must have an equal number of 1s and 0s.</li>
			<li>For example, in a 4x4 grid, each row and column should contain two 1s and two 0s.</li>
			<li>Correct: <PuzzleRowExample values="10101100" /></li>
			<li>Incorrect: <PuzzleRowExample values="10101101" :incorrect="[0, 2, 4, 5, 7]" /></li>
		</ul>

		<h3 class="rule-heading">Maximum Two Consecutive Symbols</h3>
		<ul>
			<li>No more than two of the same number can be next to or under each other.</li>
			<li>This means you cannot have three consecutive 1s or 0s in any row or column.</li>
			<li>Correct: <PuzzleRowExample
									values="11..001."
								/></li>
			<li>Incorrect: <PuzzleRowExample
									values="111.001."
									:incorrect="[0, 1, 2]"
								/></li>
		</ul>

		<h3 class="rule-heading">Unique Rows and Columns</h3>
		<ul>
			<li>Each row and each column must be unique.</li>
			<li>No two rows can be the same, and no two columns can be the same.</li>
			<li>Correct: <PuzzleRowExample
									values="01011001010110.."
									:multirow="true"
									:highlight="[6, 7, 14, 15]"
									:rowlength="8"
								/><div class="text-center"> \/   \/ </div><PuzzleRowExample
									values="0101100101011010"
									:highlight="[6, 7, 14, 15]"
									multirow
									:rowlength="8"
								/></li>
			<li>Incorrect: <PuzzleRowExample
									multirow
									:rowlength="8"
									values="0101100101011001"
									:incorrect="[6, 7, 14, 15]"
								/>These rows are the same, which is not allowed.</li>
		</ul>

		<h2>Puzzle Variations</h2>
		<p>In addition to standard puzzles, there is one puzzle variation available:</p>
		<h3>Odd-Sized Puzzles</h3>
		<ul>
			<li>In puzzles with an odd number of rows and columns, the rule for balanced lines is slightly altered.</li>
			<li>In these cases, each line will have one more 1 than 0.</li>
			<li>This means in a 5x5 grid, each row and column should contain three 1s and two 0s.</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
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